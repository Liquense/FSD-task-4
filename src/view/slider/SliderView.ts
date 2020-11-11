import { ResizeObserver } from 'resize-observer';

import { DEFAULT_SLIDER_CLASS, RANGE_PAIR_END_KEY, RANGE_PAIR_START_KEY } from '../../constants';

import { SliderVisualParams } from '../../model/types';
import {
  clamp, hasOwnProperty,
  preventDefault,
  roundToDecimal,
  standardize,
} from '../../utils/functions';
import {
  HandlersViewData,
  HandlerViewParams,
  SliderViewUpdateParams,
} from '../types';

import { Slider, View } from '../interfaces';
import HandlerView from './handler/HandlerView';
import RangeView from './range/RangeView';
import MarkupView from './markup/MarkupView';

class SliderView implements Slider {
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

  private activeHandler: HandlerView;

  private isTooltipsAlwaysVisible: boolean;

  private isMarkupVisible: boolean;

  private markup: MarkupView;

  private stepPart: number;

  private min: number;

  private max: number;

  private ranges: RangeView[] = [];

  private resizeObserver: ResizeObserver;

  constructor(private parentView: View, params?: SliderVisualParams) {
    this.initProperties(params);
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

  public getOffsetDirection(): 'top' | 'left' {
    if (this.isVertical) {
      return 'top';
    }
    return 'left';
  }

  public getExpandDimension(): 'height' | 'width' {
    if (this.isVertical) {
      return 'height';
    }
    return 'width';
  }

  public getScaleLength(): number {
    return this.elements.scale.getBoundingClientRect()[this.getExpandDimension()];
  }

  public setOrientation(isVertical: boolean): void {
    if (isVertical === undefined || isVertical === null) { return; }

    const oldOrientClass = this.getOrientationClass();
    this.isVertical = isVertical;
    const newOrientClass = this.getOrientationClass();

    this.elements.wrap.classList.remove(oldOrientClass);
    this.elements.wrap.classList.add(newOrientClass);
  }

  public getIsTooltipsAlwaysVisible(): boolean {
    return this.isTooltipsAlwaysVisible;
  }

  public setTooltipsVisibility(isVisible?: boolean): void {
    if (isVisible === undefined || isVisible === null) { return; }

    this.isTooltipsAlwaysVisible = isVisible;
    this.handlers.forEach((handler) => {
      handler.setTooltipVisibility(isVisible);
    });
  }

  public getOrientationClass(): string {
    return this.isVertical
      ? `${DEFAULT_SLIDER_CLASS}_vertical` : `${DEFAULT_SLIDER_CLASS}_horizontal`;
  }

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

  public initHandlers(handlersData: HandlersViewData): void {
    this.clearHandlers();
    this.handlers = handlersData.handlersArray.map((handler, index, handlers) => {
      const newHandler = new HandlerView(this, {
        ...handler,
        isTooltipVisible: this.isTooltipsAlwaysVisible,
      });

      if (handlersData.isCustomHandlers) { return newHandler; }

      if (handlers.length === 2) {
        if (index === 0) {
          newHandler.setRangePair(this.isRangesInverted ? RANGE_PAIR_START_KEY : 1);
        }
        if (index === 1) {
          newHandler.setRangePair(this.isRangesInverted ? RANGE_PAIR_END_KEY : 0);
        }
      } else {
        newHandler
          .setRangePair(this.isRangesInverted ? RANGE_PAIR_END_KEY : RANGE_PAIR_START_KEY);
      }
      return newHandler;
    });

    this.setHandlerSize();
    this.initMarkup();
    this.createRanges();
  }

  public addHandler(handlerParams: HandlerViewParams): void {
    const newHandler = new HandlerView(
      this,
      { ...handlerParams, isTooltipVisible: this.isTooltipsAlwaysVisible },
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

  public calculateRelativeHandlerSize(): number {
    return this.handlerSize / this.getWorkZoneLength();
  }

  public setHandlersData(handlers: HandlerViewParams[]): void {
    if (handlers.some((handler) => handler === null)) return;

    handlers.forEach(({ handlerIndex, item, positionPart }) => {
      const realIndex = this.handlers.findIndex(
        (handler) => handler.getIndex() === handlerIndex,
      );
      if (realIndex === -1) {
        return;
      }

      this.handlers[realIndex].setItem(item);
      this.handlers[realIndex].setPosition(positionPart);
    });
  }

  public update(
    {
      min, max, stepPart, isVertical, isTooltipsVisible, isMarkupVisible,
    }: SliderViewUpdateParams = {},
  ): void {
    if (Number.isFinite(stepPart)) {
      this.stepPart = stepPart;
    }
    if (Number.isFinite(min)) {
      this.min = min;
    }
    if (Number.isFinite(max)) {
      this.max = max;
    }
    this.isMarkupVisible = isMarkupVisible ?? this.isMarkupVisible;
    this.setTooltipsVisibility(isTooltipsVisible);
    this.setOrientation(isVertical);

    this.refreshElements();
  }

  private initProperties({
    isVertical, isInverted, isTooltipsVisible, isMarkupVisible,
  }: SliderVisualParams = {}): void {
    this.isVertical = isVertical ?? isVertical;
    this.isRangesInverted = isInverted ?? this.isRangesInverted;
    if (isTooltipsVisible !== undefined) {
      this.setTooltipsVisibility(isTooltipsVisible);
    }
    if (isMarkupVisible !== undefined) {
      this.isMarkupVisible = isMarkupVisible;
    }
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
    parentElement.append(wrap);

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

  private handleWindowMouseOut = (event: MouseEvent): void => {
    const { target } = event;
    const nodeNameKey = 'nodeName';

    if (!hasOwnProperty(target, nodeNameKey)) return;
    if (target[nodeNameKey] === 'HTML') {
      document.body.removeEventListener('mousemove', this.handleMouseMove);
    }
  }

  private handleDocumentMouseDown(event: MouseEvent): void {
    if (!(event.target instanceof HTMLElement)) return;

    const { target } = event;
    if (!this.elements.wrap.contains(target)) {
      this.deactivateActiveHandler();
    }
  }

  private handleMouseUp(): void {
    document.body.removeEventListener('mousemove', this.handleMouseMove);
    document.body.removeEventListener('mouseout', this.handleWindowMouseOut);
  }

  private handleMouseDown(event: MouseEvent): void {
    const closestHandler = this.getClosestToMouseHandler(event.clientX, event.clientY);

    if (!closestHandler) { return; }

    this.activateHandler(closestHandler);
    this.activeHandler.getBody().focus();

    this.handleMouseMove(event);
    document.body.addEventListener('mousemove', this.handleMouseMove);

    window.addEventListener('mouseout', this.handleWindowMouseOut);
  }

  private handleMouseMove = (event: MouseEvent): void => {
    const closestHandler = this.getClosestToMouseHandler(event.clientX, event.clientY);

    if (closestHandler !== this.activeHandler) {
      return;
    }

    this.activateHandler(closestHandler);

    const mousePosition = this.calculateMouseRelativePos(event);
    let standardMousePosition: number;

    const stepsRemainder = 1 % this.stepPart;
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
        step: this.stepPart,
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
      this.activeHandler.setTooltipVisibility(this.isTooltipsAlwaysVisible);
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
    if (handler.getRangePair() === null) { return null; }

    const pairedHandler = this.findSuitableHandler(handler);

    const isPairedWithStart = handler.getRangePair() === RANGE_PAIR_START_KEY;
    const isPairedWithEnd = (handler.getRangePair() === RANGE_PAIR_END_KEY);
    const isPairedWithHandler = !isPairedWithStart && !isPairedWithEnd;
    if (isPairedWithHandler && !pairedHandler) { return null; }

    return new RangeView(this, this.elements.scale, handler, pairedHandler);
  }

  private initMarkup():
      void {
    this.markup = new MarkupView(this);
    this.updateMarkup();
  }

  private clearMarkup(): void {
    if (this.markup) {
      this.markup.clearAllMarks();
    }
  }

  private updateMarkup(): void {
    this.clearMarkup();

    if (!this.isMarkupVisible) { return; }

    requestAnimationFrame(() => {
      for (let i = 0; i <= 1; i = roundToDecimal(i + this.stepPart, 5)) {
        const standardPosition = standardize(i, { min: 0, max: 1, step: this.stepPart });
        const shrinkPosition = standardPosition * this.calculateShrinkRatio();
        this.markup.addMark(shrinkPosition, this.calculateRelativeHandlerSize());
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

export default SliderView;
