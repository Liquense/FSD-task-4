import { ResizeObserver } from 'resize-observer';

import {
  KeyStringObj, Presentable, Slider, View,
} from '../../utils/interfacesAndTypes';
import {
  addListenerAfter,
  clamp,
  preventDefault,
  roundToDecimal,
  standardize,
} from '../../utils/functions';

import HandlerView from './handler/handlerView';
import RangeView from './range/rangeView';
import MarkupView from './markup/markupView';
import { DEFAULT_SLIDER_CLASS } from '../../constants';

export default class SliderView implements Slider {
  public listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

  private isRangesInverted = false;

  private handlerSize = 0;

  private handlers: HandlerView[] = [];

  private isVertical: boolean;

  private elements: {
      [key: string]: HTMLElement;
      wrap: HTMLElement;
      body: HTMLElement;
      scale: HTMLElement;
      handlers: HTMLElement;
      min: HTMLElement;
      max: HTMLElement;
  };

  private rangePairStartKey = 'start';

  private rangePairEndKey = 'end';

  private activeHandler: HandlerView;

  private tooltipsAlwaysVisible: boolean;

  private withMarkup: boolean;

  private markup: MarkupView;

  private step = 0.01;

  private min: number;

  private max: number;

  private ranges: RangeView[] = [];

  private boundHandleWindowMouseOut = this.handleWindowMouseOut.bind(this);

  private handleMouseMoveBound = this.handleMouseMove.bind(this);

  private resizeObserver: ResizeObserver;

  constructor(
      private parentView: View,
      parameters?: {
          isVertical?: boolean;
          showTooltips?: boolean;
          isReversed?: boolean;
          isRange?: boolean;
          withMarkup?: boolean;
      },
  ) {
    if (parameters?.isVertical !== undefined) {
      this.isVertical = parameters.isVertical;
    }
    if (parameters?.isReversed !== undefined) {
      this.isRangesInverted = parameters.isReversed;
    }
    if (parameters?.showTooltips !== undefined) {
      this.setTooltipsVisibility(parameters.showTooltips);
    }
    if (parameters?.withMarkup !== undefined) {
      this.withMarkup = parameters.withMarkup;
    }

    this.createElements();
    this.setMouseEvents();
    this.setResizeObserver();
  }

  public setRangesInversion(isInverted: boolean): void {
    this.isRangesInverted = isInverted;
  }

  public getBodyElement(): HTMLElement {
    return this.elements.body;
  }

  public getHandlersContainer(): HTMLElement {
    return this.elements.handlers;
  }

  public getScaleStart(): number {
    return this.isVertical
      ? this.elements.scale.getBoundingClientRect().top
      : this.elements.scale.getBoundingClientRect().left;
  }

  public getScaleEnd(): number {
    return this.isVertical
      ? this.elements.scale.getBoundingClientRect().bottom
      : this.elements.scale.getBoundingClientRect().right;
  }

  public getScaleBorderWidth(): number {
    return Number.parseFloat(
      getComputedStyle(this.elements.scale).getPropertyValue(`border-${this.getOffsetDirection()}-width`),
    );
  }

  public calculateShrinkRatio(): number {
    return this.getWorkZoneLength() / this.getScaleLength();
  }

  public getIsVertical(): boolean {
    return this.isVertical;
  }

  public getOffsetDirection(): string {
    if (this.isVertical) {
      return 'top';
    }
    return 'left';
  }

  public getExpandDimension(): string {
    if (this.isVertical) {
      return 'height';
    }
    return 'width';
  }

  public getScaleLength(): number {
    return Number.parseFloat(
      (this.elements.scale.getBoundingClientRect() as KeyStringObj)[this.getExpandDimension()],
    );
  }

  public setOrientation(isVertical: boolean): void {
    const oldOrientClass = this.getOrientationClass();
    this.isVertical = isVertical;
    const newOrientClass = this.getOrientationClass();

    this.elements.wrap.classList.remove(oldOrientClass);
    this.elements.wrap.classList.add(newOrientClass);
  }

  public setTooltipsVisibility(stateToSet?: boolean): void {
    const stateToPass = (stateToSet === undefined) || (stateToSet === null)
      ? (this.tooltipsAlwaysVisible) : (stateToSet);

    this.tooltipsAlwaysVisible = stateToPass;
    this.handlers.forEach((handler) => {
      handler.setTooltipVisibility(stateToPass);
    });
  }

  public getOrientationClass(): string {
    return this.isVertical
      ? `${DEFAULT_SLIDER_CLASS}_vertical` : `${DEFAULT_SLIDER_CLASS}_horizontal`;
  }

  /**
 * Возвращает позицию мыши относительно начала шкалы в стандартизированном виде
 * @param mouseEvent
 */
  public calculateMouseRelativePos(mouseEvent: MouseEvent): number {
    const mouseCoordinate = this.isVertical ? mouseEvent.clientY : mouseEvent.clientX;
    const initialOffset = this.handlerSize / 2;
    const scaledCoordinate = (mouseCoordinate - this.getScaleStart() - initialOffset)
      / this.calculateShrinkRatio();

    return clamp((scaledCoordinate) / this.getScaleLength(), 0, 1);
  }

  public clearRanges(): void {
    this.ranges.forEach((range) => {
      range.remove();
    });
    this.ranges = [];
  }

  public createRanges(): void {
    this.clearRanges();

    this.handlers.forEach((handler) => {
      const newRange = this.createRange(handler);
      if (newRange) {
        this.ranges.push(newRange);
      }
    });
  }

  public initHandlers(
    handlersData: {
          customHandlers: boolean;
          handlersArray: {
              handlerIndex: number;
              positionPart: number;
              item: Presentable;
              withTooltip?: boolean;
              rangePair?: string;
          }[];
      },
  ): void {
    this.clearHandlers();

    this.handlers = handlersData.handlersArray.map((handler, index, handlers) => {
      const newHandler = new HandlerView(this, {
        ...handler,
        withTooltip: this.tooltipsAlwaysVisible,
      });

      if (!handlersData.customHandlers) {
        if (handlers.length === 2) {
          if (index === 0) {
            newHandler.setRangePair(this.isRangesInverted ? this.rangePairStartKey : 1);
          }
          if (index === 1) {
            newHandler.setRangePair(this.isRangesInverted ? this.rangePairEndKey : 0);
          }
        } else {
          newHandler
            .setRangePair(this.isRangesInverted ? this.rangePairEndKey : this.rangePairStartKey);
        }
      }

      return newHandler;
    });

    this.setHandlerSize();
    this.initMarkup();
    this.createRanges();
  }

  public addHandler(
    handlerParams: {
          positionPart: number;
          item: Presentable;
          handlerIndex: number;
          rangePair: number | string;
      },
  ): void {
    if (!handlerParams) return;

    const newHandler = new HandlerView(
      this,
      {
        handlerIndex: handlerParams.handlerIndex,
        item: handlerParams.item,
        positionPart: handlerParams.positionPart,
        rangePair: handlerParams.rangePair,
        withTooltip: this.tooltipsAlwaysVisible,
      },
    );

    this.handlers.push(newHandler);
    const newRange = this.createRange(newHandler);
    if (newRange) {
      this.ranges.push(newRange);
    }
  }

  public removeHandler(handlerIndex: number): void {
    const handlerToRemoveIndex = this.handlers.findIndex(
      (handler) => handler.getIndex() === handlerIndex,
    );
    const handlerToRemove = this.handlers[handlerToRemoveIndex];
    const rangesToRemove = this.ranges.filter((range) => range.hasHandler(handlerToRemove));

    rangesToRemove.forEach((range) => {
      const rangeIndex = this.ranges.indexOf(range);
      range.remove();
      this.ranges.splice(rangeIndex, 1);
    });

    handlerToRemove.remove();
    this.handlers.splice(handlerToRemoveIndex, 1);
  }

  public getWorkZoneLength(): number {
    const { handlerSize } = this;
    const scaleSize = this.getScaleLength();
    return scaleSize - handlerSize;
  }

  public calculateHandlerOffset(relativePosition: number): number {
    return this.getWorkZoneLength() * relativePosition;
  }

  public calcRelativeHandlerSize(): number {
    return this.handlerSize / this.getWorkZoneLength();
  }

  public setHandlersData(
    handlers: { index: number; item: Presentable; relativeValue: number }[],
  ): void {
    if (handlers.some((handler) => handler === null)) return;

    handlers.forEach(({ index, item, relativeValue }) => {
      const realIndex = this.handlers.findIndex(
        (handler) => handler.getIndex() === index,
      );
      if (realIndex === -1) {
        return;
      }

      this.handlers[realIndex].setItem(item);
      this.handlers[realIndex].setPosition(relativeValue);
    });
  }

  public update(
    data?:
      {
          min?: number; max?: number; step?: number;
          isVertical?: boolean; tooltipsVisible?: boolean; withMarkup?: boolean;
      },
  ): void {
    if (Number.isFinite(data?.step)) {
      this.step = data.step;
    }
    if (Number.isFinite(data?.min)) {
      this.min = data.min;
    }
    if (Number.isFinite(data?.max)) {
      this.max = data.max;
    }
    if (data?.tooltipsVisible !== undefined) {
      this.setTooltipsVisibility(data.tooltipsVisible);
    }
    if (data?.isVertical !== undefined) {
      this.setOrientation(data.isVertical);
    }
    if (data?.withMarkup !== undefined) {
      this.withMarkup = data.withMarkup;
    }

    this.refreshElements();
  }

  public addOnMouseDownListener(listener: Function): void {
    this.elements.body.removeEventListener('mousedown', this.handleMouseDown);

    addListenerAfter(this.handleMouseDown.name, listener, this);

    this.elements.body.addEventListener('mousedown', this.handleMouseDown);
  }

  private setHandlerSize(): void {
    const exemplarHandler = this.handlers[0];
    this.handlerSize = exemplarHandler.getSize();
  }

  private createElements(): void {
    const parentElement = this.parentView.getBody();
    this.elements = {
      wrap: document.createElement('div'),
      body: document.createElement('div'),
      scale: document.createElement('div'),
      handlers: document.createElement('div'),
      min: document.createElement('span'),
      max: document.createElement('span'),
    };

    const { wrap } = this.elements;
    wrap.classList.add(DEFAULT_SLIDER_CLASS);
    parentElement.replaceWith(wrap);

    Object.keys(this.elements).forEach((elementName) => {
      if (elementName === 'wrap') return;

      const element = this.elements[elementName];
      element.classList.add(`${DEFAULT_SLIDER_CLASS}__${elementName}`);
    });

    this.elements.body.addEventListener('mousedown', preventDefault);

    wrap.append(this.elements.body);
    wrap.append(this.elements.min);
    wrap.append(this.elements.max);
    this.elements.body.append(this.elements.scale);
    this.elements.body.append(this.elements.handlers);

    this.setOrientation(this.isVertical);
  }

  private setMouseEvents(): void {
    document.body.addEventListener(
      'mousedown',
      this.handleDocumentMouseDown.bind(this),
    );
    this.elements.body.addEventListener(
      'mousedown',
      this.handleMouseDown.bind(this),
    );
    document.body.addEventListener(
      'mouseup',
      this.handleMouseUp.bind(this),
    );
  }

  private setResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(this.refreshElements.bind(this));
    this.resizeObserver.observe(this.elements.body);
  }

  private handleWindowMouseOut(event: MouseEvent): void {
    const from = event.target as HTMLElement;
    if (from.nodeName === 'HTML') {
      document.body.removeEventListener('mousemove', this.handleMouseMoveBound);
    }
  }

  private handleDocumentMouseDown(event: MouseEvent): void {
    const target = (event.target) as HTMLElement;
    if (!this.elements.wrap.contains(target)) {
      this.deactivateActiveHandler();
    }
  }

  private handleMouseUp(): void {
    document.body.removeEventListener('mousemove', this.handleMouseMoveBound);
    document.body.removeEventListener('mouseout', this.handleWindowMouseOut);
  }

  private handleMouseDown(event: MouseEvent): MouseEvent {
    const closestHandler = this.getClosestToMouseHandler(event.clientX, event.clientY);

    if (!closestHandler) {
      return event;
    }

    this.activateHandler(closestHandler);
    this.activeHandler.getBody().focus();

    this.handleMouseMove(event);
    document.body.addEventListener('mousemove', this.handleMouseMoveBound);

    window.addEventListener('mouseout', this.boundHandleWindowMouseOut);

    return event;
  }

  private handleMouseMove(event: MouseEvent): void {
    const closestHandler = this.getClosestToMouseHandler(event.clientX, event.clientY);

    if (closestHandler !== this.activeHandler) {
      return;
    }

    this.activateHandler(closestHandler);

    const mousePosition = this.calculateMouseRelativePos(event);
    let standardMousePosition: number;

    const stepsRemainder = 1 % this.step;
    const penultimatePosition = 1 - stepsRemainder;
    if (mousePosition > penultimatePosition && stepsRemainder !== 0) {
      standardMousePosition = standardize(mousePosition, {
        min: penultimatePosition,
        max: 1,
        step: stepsRemainder,
      });
    } else {
      standardMousePosition = standardize(mousePosition, {
        min: 0,
        max: penultimatePosition,
        step: this.step,
      });
    }

    if (standardMousePosition === roundToDecimal(closestHandler.getPositionPart(), 4)) {
      return;
    }

    this.parentView.handleHandlerPositionChanged(closestHandler.getIndex(), standardMousePosition);
  }

  private deactivateActiveHandler(): void {
    this.activateHandler(null);
  }

  private activateHandler(handlerToActivate: HandlerView): void {
    if (this.activeHandler) {
      this.activeHandler.setTooltipVisibility(this.tooltipsAlwaysVisible);
    }

    this.activeHandler = handlerToActivate;

    if (handlerToActivate) {
      handlerToActivate.setTooltipVisibility(true);
    }
  }

  private getClosestToMouseHandler(mouseX: number, mouseY: number): HandlerView {
    return this.isVertical ? this.findClosestHandler(mouseY) : this.findClosestHandler(mouseX);
  }

  private findClosestHandler(mouseCoordinate: number): HandlerView {
    let minDistance = Number.MAX_VALUE;
    let closestHandler: HandlerView = null;

    this.handlers.forEach((handler) => {
      const distance = Math.abs(handler.getPositionCoordinate() - mouseCoordinate);

      if (minDistance > distance) {
        closestHandler = handler;
        minDistance = distance;
      }
    });

    return closestHandler;
  }

  private findSuitableHandler(firstHandler: HandlerView): HandlerView {
    return this.handlers.find(
      (handler) => handler.getIndex() === firstHandler.getRangePair(),
    );
  }

  private createRange(handler: HandlerView): RangeView {
    if (handler.getRangePair() === null) {
      return null;
    }

    const secondHandler = this.findSuitableHandler(handler);

    if (!secondHandler) {
      if ((handler.getRangePair() !== this.rangePairStartKey)
              && (handler.getRangePair() !== this.rangePairEndKey)) return null;
    }

    return new RangeView(this, this.elements.scale, handler, secondHandler);
  }

  private initMarkup():
      void {
    this.markup = new MarkupView(this);
    this.updateMarkup();
  }

  private clearMarkup(): void {
    if (!this.markup) { return; }
    this.markup.clearAllMarks();
  }

  private updateMarkup(): void {
    this.clearMarkup();

    if (!this.withMarkup) { return; }

    requestAnimationFrame(() => {
      for (let i = 0; i <= 1; i = roundToDecimal(i + this.step, 5)) {
        const standardPosition = standardize(i, { min: 0, max: 1, step: this.step });
        const shrinkPosition = standardPosition * this.calculateShrinkRatio();
        this.markup.addMark(shrinkPosition, this.calcRelativeHandlerSize());
      }
    });
  }

  private clearHandlers(): void {
    this.clearRanges();
    this.elements.handlers.innerHTML = '';
    this.handlers = [];
  }

  private refreshElements(): void {
    this.updateMarkup();

    this.handlers.forEach((handler) => {
      handler.refreshPosition();
    });

    this.ranges.forEach((range) => {
      range.refreshPosition();
    });

    this.elements.min.innerText = this.min?.toFixed(2);
    this.elements.max.innerText = this.max?.toFixed(2);
  }
}
