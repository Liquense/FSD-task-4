import { ResizeObserver } from 'resize-observer';
import bind from 'bind-decorator';

import { DEFAULT_SLIDER_CLASS, RANGE_PAIR_END_KEY, RANGE_PAIR_START_KEY } from '../constants';

import {
  HandlerModelData,
  PositioningData, SliderData,
} from '../model/types';
import {
  hasOwnProperty,
  preventDefault,
  roundToDecimal,
  standardize,
} from '../utils/functions';
import {
  HandlerPositionData,
  HandlersViewData,
  HandlerViewParams, SliderViewData,
  SliderViewUpdateParams,
} from './types';

import { View } from './interfaces';
import HandlerView from './handler/HandlerView';
import RangeView from './range/RangeView';
import MarkupView from './markup/MarkupView';
import ScaleView from './scale/ScaleView';
import { Observable, Observer } from '../utils/Observer/Observer';
import { RangeViewUpdateParams } from './range/types';
import { HandlerViewUpdatePositionParams } from './handler/types';

class SliderView implements Observable, View {
  public observers: { [key: string]: Observer } = {};

  private isRangesInverted = false;

  private handlerSize: number;

  private handlers: HandlerView[] = [];

  private scale: ScaleView;

  private isVertical: boolean;

  private elements: {
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

  private minIndex: number;

  private maxIndex: number;

  private ranges: RangeView[] = [];

  private resizeObserver: ResizeObserver;

  constructor(private wrapElement: HTMLElement, params: SliderData & PositioningData) {
    this.initProperties(params);
    this.createElements();
    this.initScale();
    this.initMouseEvents();
    this.initResizeObserver();
  }

  public handleHandlerPositionChanged(handlerPositionData: HandlerPositionData): void {
    if (this.observers.handleHandlerPositionChanged) {
      this.observers.handleHandlerPositionChanged.callListeners(handlerPositionData);
    }
  }

  public initHandlers(handlersData: HandlersViewData): void {
    this.clearHandlers();
    this.handlers = handlersData.handlersArray.map((handler, index, handlers) => {
      const newHandler = new HandlerView(
        this.elements.handlers,
        { ...handler, isTooltipVisible: this.isTooltipsAlwaysVisible },
        this.makeHandlerViewUpdatePositionParams(),
      );

      if (handlersData.isCustomHandlers) {
        return newHandler;
      }

      if (handlers.length === 2) {
        if (index === 0) {
          newHandler.setPair(this.isRangesInverted ? RANGE_PAIR_START_KEY : 1);
        }
        if (index === 1) {
          newHandler.setPair(this.isRangesInverted ? RANGE_PAIR_END_KEY : 0);
        }
      } else {
        newHandler
          .setPair(this.isRangesInverted ? RANGE_PAIR_END_KEY : RANGE_PAIR_START_KEY);
      }
      return newHandler;
    });

    this.setHandlerSize();
    this.initMarkup();
    this.createRanges();
    this.addHandlersObservers();
  }

  public addHandler(handlerParams: HandlerViewParams): void {
    const newHandler = new HandlerView(
      this.elements.handlers,
      { ...handlerParams, isTooltipVisible: this.isTooltipsAlwaysVisible },
      this.makeHandlerViewUpdatePositionParams(),
    );
    this.handlers.push(newHandler);
    this.addHandlerUpdatePositionObserver(newHandler);

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
    this.removeHandlerUpdatePositionObserver(handlerToRemove);
    this.handlers.splice(handlerToRemoveIndex, 1);
  }

  public setHandlersData(handlers: HandlerModelData[]): void {
    if (handlers.some((handler) => handler === null)) return;

    handlers.forEach(({ handlerIndex, item, positionPart }) => {
      const realIndex = this.handlers.findIndex(
        (handler) => handler.getIndex() === handlerIndex,
      );
      if (realIndex === -1) {
        return;
      }

      this.handlers[realIndex].setItem(item);
      this.handlers[realIndex].setPosition({
        ...{ positionPart },
        ...this.makeHandlerViewUpdatePositionParams(),
      });
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
      this.minIndex = min;
    }
    if (Number.isFinite(max)) {
      this.maxIndex = max;
    }
    if (typeof isMarkupVisible === 'boolean') {
      this.isMarkupVisible = isMarkupVisible;
    }
    this.setTooltipsVisibility(isTooltipsVisible);
    this.setOrientation(isVertical);

    this.updateElements();
  }

  private getOffsetDirection(): 'top' | 'left' {
    if (this.isVertical) {
      return 'top';
    }
    return 'left';
  }

  private getExpandDimension(): 'height' | 'width' {
    if (this.isVertical) {
      return 'height';
    }
    return 'width';
  }

  private getScaleLength(): number {
    return this.scale.getLength(this.getExpandDimension());
  }

  private getWorkZoneLength(): number {
    return this.scale.getWorkZoneLength(this.getExpandDimension(), this.handlerSize);
  }

  private calculateRelativeHandlerSize(): number {
    return this.handlerSize / this.getWorkZoneLength();
  }

  private setOrientation(isVertical: boolean): void {
    if (isVertical === undefined || isVertical === null) {
      return;
    }

    const oldOrientationClass = this.getOrientationClass();
    this.isVertical = isVertical;
    const newOrientationClass = this.getOrientationClass();

    this.elements.wrap.classList.remove(oldOrientationClass);
    this.elements.wrap.classList.add(newOrientationClass);
  }

  private setTooltipsVisibility(isVisible?: boolean): void {
    if (isVisible === undefined || isVisible === null) {
      return;
    }

    this.isTooltipsAlwaysVisible = isVisible;
    this.handlers.forEach((handler) => {
      handler.setTooltipVisibility(isVisible);
    });
  }

  private getOrientationClass(): string {
    return this.isVertical
      ? `${DEFAULT_SLIDER_CLASS}_vertical` : `${DEFAULT_SLIDER_CLASS}_horizontal`;
  }

  private calculateMouseRelativePosition(mouseEvent: MouseEvent): number {
    return this.scale.calculateMouseRelativePosition(mouseEvent, this.getSliderViewData());
  }

  private clearRanges(): void {
    this.ranges.forEach((range) => {
      range.remove();
    });
    this.ranges = [];
  }

  private createRanges(): void {
    this.clearRanges();

    this.handlers.forEach((handler) => {
      const newRange = this.createRange(handler);
      if (newRange) {
        this.ranges.push(newRange);
      }
    });
  }

  private getScaleStart(): number {
    return this.scale.getStart(this.isVertical);
  }

  private getScaleEnd(): number {
    return this.scale.getEnd(this.isVertical);
  }

  private getScaleBorderWidth(): number {
    return this.scale.getBorderWidth(this.getOffsetDirection());
  }

  private calculateShrinkRatio(): number {
    return this.scale.calculateShrinkRatio(
      this.getExpandDimension(), this.handlerSize,
    );
  }

  private initProperties({
    isVertical, isInverted, isTooltipsVisible, isMarkupVisible, min, max, stepPart,
  }: SliderData & PositioningData): void {
    this.isVertical = isVertical;
    this.isRangesInverted = isInverted;
    this.isMarkupVisible = isMarkupVisible;
    this.minIndex = min;
    this.maxIndex = max;
    this.stepPart = stepPart;
    this.setTooltipsVisibility(isTooltipsVisible);
  }

  private setHandlerSize(): void {
    if (this.handlers.length === 0) {
      return;
    }

    const exemplarHandler = this.handlers[0];
    this.handlerSize = exemplarHandler.getSize(this.getExpandDimension());
  }

  private createElements(): void {
    const parentElement = this.wrapElement;
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

    Object.entries(this.elements).forEach((entry) => {
      const key = entry[0];
      const element = entry[1];
      if (key === 'wrap') return;

      element.classList.add(`${DEFAULT_SLIDER_CLASS}__${key}`);
    });

    this.elements.body.addEventListener('mousedown', preventDefault);

    wrap.append(this.elements.body);
    wrap.append(this.elements.min);
    wrap.append(this.elements.max);
    this.elements.body.append(this.elements.scale);
    this.elements.body.append(this.elements.handlers);

    this.setOrientation(this.isVertical);
  }

  private initScale(): void {
    this.scale = new ScaleView(this.elements.scale);
  }

  private initMouseEvents(): void {
    document.body.addEventListener(
      'mousedown',
      this.handleDocumentMouseDown,
    );
    this.elements.body.addEventListener(
      'mousedown',
      this.handleMouseDown,
    );
    document.body.addEventListener(
      'mouseup',
      this.handleMouseUp,
    );
  }

  private addHandlerUpdatePositionObserver(handler: HandlerView): void {
    Observer.addListener('updatePosition', handler, this.updateRanges);
  }

  private removeHandlerUpdatePositionObserver(handler: HandlerView): void {
    Observer.removeListener('updatePosition', handler, this.updateRanges);
  }

  private addHandlersObservers(): void {
    this.handlers.forEach((handler) => {
      this.addHandlerUpdatePositionObserver(handler);
    });
  }

  private initResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(this.updateElements);
    this.resizeObserver.observe(this.elements.body);
  }

  @bind
  private handleWindowMouseOut(event: MouseEvent): void {
    const { target } = event;
    const nodeNameKey = 'nodeName';

    if (!hasOwnProperty(target, nodeNameKey)) return;
    if (target[nodeNameKey] === 'HTML') {
      document.body.removeEventListener('mousemove', this.handleMouseMove);
    }
  }

  @bind
  private handleDocumentMouseDown(event: MouseEvent): void {
    if (!(event.target instanceof HTMLElement)) return;

    const { target } = event;
    if (!this.elements.wrap.contains(target)) {
      this.deactivateActiveHandler();
    }
  }

  @bind
  private handleMouseUp(): void {
    document.body.removeEventListener('mousemove', this.handleMouseMove);
    document.body.removeEventListener('mouseout', this.handleWindowMouseOut);
  }

  @bind
  private handleMouseDown(event: MouseEvent): void {
    const closestHandler = this.getHandlerClosestToMouse(event.clientX, event.clientY);

    if (!closestHandler) {
      return;
    }

    this.activateHandler(closestHandler);
    this.activeHandler.getHandlerBody().focus();

    this.handleMouseMove(event);
    document.body.addEventListener('mousemove', this.handleMouseMove);

    window.addEventListener('mouseout', this.handleWindowMouseOut);
  }

  @bind
  private handleMouseMove(event: MouseEvent): HandlerPositionData {
    const closestHandler = this.getHandlerClosestToMouse(event.clientX, event.clientY);
    if (closestHandler !== this.activeHandler) {
      return null;
    }

    this.activateHandler(closestHandler);

    const mousePosition = this.calculateMouseRelativePosition(event);
    let standardMousePosition: number;
    const stepsRemainder = 1 % this.stepPart;
    const penultimatePosition = 1 - stepsRemainder;
    const withRemainder = stepsRemainder !== 0;
    if (mousePosition > penultimatePosition && withRemainder) {
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

    if (standardMousePosition === roundToDecimal(closestHandler.getPositionPart())) {
      return null;
    }

    const result = { handlerIndex: closestHandler.getIndex(), position: standardMousePosition };
    if (this.observers.handleMouseMove) {
      this.observers.handleMouseMove.callListeners(result);
    }

    this.handleHandlerPositionChanged(result);
    return result;
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

  private getHandlerClosestToMouse(mouseX: number, mouseY: number): HandlerView {
    return this.isVertical
      ? this.findHandlerClosestToMouse(mouseY)
      : this.findHandlerClosestToMouse(mouseX);
  }

  private findHandlerClosestToMouse(mouseCoordinate: number): HandlerView {
    let minDistance = Number.MAX_VALUE;
    let closestHandler: HandlerView = null;

    this.handlers.forEach((handler) => {
      const distance = handler.calculateDistanceToMouse(mouseCoordinate, this.isVertical);

      if (minDistance > distance) {
        closestHandler = handler;
        minDistance = distance;
      }
    });

    return closestHandler;
  }

  private findPairedHandler(firstHandler: HandlerView): HandlerView {
    return this.handlers.find(
      (handler) => handler.getIndex() === firstHandler.getPair(),
    );
  }

  private createRange(handler: HandlerView): RangeView {
    if (handler.getPair() === null) {
      return null;
    }

    const pairedHandler = this.findPairedHandler(handler);

    const isPairedWithStart = handler.getPair() === RANGE_PAIR_START_KEY;
    const isPairedWithEnd = handler.getPair() === RANGE_PAIR_END_KEY;
    const isPairedWithHandler = !isPairedWithStart && !isPairedWithEnd;
    if (isPairedWithHandler && !pairedHandler) {
      return null;
    }

    return new RangeView(
      this.elements.scale, this.makeRangeViewUpdateParams(), handler, pairedHandler,
    );
  }

  @bind
  private initMarkup(): void {
    this.markup = new MarkupView(this.elements.body, this.elements.handlers);
    this.updateMarkup();
  }

  private clearMarkup(): void {
    if (this.markup) {
      this.markup.clearAllMarks();
    }
  }

  private updateMarkup(): void {
    this.clearMarkup();

    if (!this.isMarkupVisible || !this.markup) {
      return;
    }

    this.markup.createMarks({
      ...this.getSliderViewData(),
      ...{ shrinkRatio: this.calculateShrinkRatio(), scaleLength: this.getScaleLength() },
    });
  }

  private clearHandlers(): void {
    this.clearRanges();
    this.elements.handlers.innerHTML = '';
    this.handlers = [];
  }

  @bind
  private updateElements(): void {
    this.updateMarkup();
    this.updateHandlers();
    this.updateRanges();
    this.updateMinMax();
  }

  private updateMinMax(): void {
    this.elements.min.innerText = this.minIndex?.toFixed(2);
    this.elements.max.innerText = this.maxIndex?.toFixed(2);
  }

  private updateHandlers(): void {
    this.handlers.forEach((handler) => {
      handler.updatePosition(this.makeHandlerViewUpdatePositionParams());
    });
  }

  @bind
  private updateRanges(): void {
    this.ranges.forEach((range) => {
      range.updatePosition(this.makeRangeViewUpdateParams());
    });
  }

  private getSliderViewData(): SliderViewData {
    return {
      stepPart: this.stepPart,
      expandDimension: this.getExpandDimension(),
      offsetDirection: this.getOffsetDirection(),
      relativeHandlerSize: this.calculateRelativeHandlerSize(),
      isVertical: this.isVertical,
    };
  }

  private makeRangeViewUpdateParams(): RangeViewUpdateParams {
    return {
      ...this.getSliderViewData(),
      ...{
        scaleStart: this.getScaleStart(),
        scaleEnd: this.getScaleEnd(),
        scaleBorderWidth: this.getScaleBorderWidth(),
      },
    };
  }

  private makeHandlerViewUpdatePositionParams(): HandlerViewUpdatePositionParams {
    return {
      expandDimension: this.getExpandDimension(),
      offsetDirection: this.getOffsetDirection(),
      workZoneLength: this.getWorkZoneLength(),
    };
  }
}

export default SliderView;
