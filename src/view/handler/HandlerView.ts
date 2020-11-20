import bind from 'bind-decorator';

import { DEFAULT_SLIDER_CLASS } from '../../constants';
import { Presentable } from '../../utils/types';

import { calculateElementCenter } from '../../utils/functions';

import { ExpandDimension, HandlerPair, HandlerViewParams } from '../types';

import TooltipView from './tooltip/TooltipView';
import { Observable, Observer } from '../../utils/Observer/Observer';
import { HandlerViewSetPositionParams, HandlerViewUpdatePositionParams } from './types';

class HandlerView implements Observable {
  public observers: { [key: string]: Observer } = {};

  private readonly tooltip: TooltipView;

  private readonly index: number;

  private positionPart: number;

  private element: {
    wrap: HTMLElement;
    body: HTMLElement;
  };

  private pair: HandlerPair;

  private static DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__handler`;

  private additionalClasses: string[] = [];

  constructor(
    handlersContainer: HTMLElement,
    initParams: HandlerViewParams,
    updatePositionParams: HandlerViewUpdatePositionParams,
  ) {
    this.initProperties(initParams);
    this.createElement(handlersContainer);

    this.index = initParams.handlerIndex;
    this.tooltip = new TooltipView(
      this.element.wrap,
      { isVisible: initParams.isTooltipVisible ?? true, item: initParams.item },
    );

    this.setItem(initParams.item);
    this.updatePosition(updatePositionParams);
  }

  public getPositionCoordinate(sliderIsVertical: boolean): number {
    const elementCenter = calculateElementCenter(this.element.body);
    return sliderIsVertical ? elementCenter.y : elementCenter.x;
  }

  public getElement(): {wrap: HTMLElement; body: HTMLElement} {
    return this.element;
  }

  public getPair(): HandlerPair {
    return this.pair;
  }

  public setPair(pair: HandlerPair): void {
    this.pair = pair;
  }

  public getIndex(): number {
    return this.index;
  }

  public getPositionPart(): number {
    return this.positionPart;
  }

  public getBody(): HTMLElement {
    return this.element.body;
  }

  public getSize(dimension: ExpandDimension): number {
    return this.element.body.getBoundingClientRect()[dimension];
  }

  public getItem(): Presentable {
    return this.tooltip.getItem();
  }

  public setItem(value: Presentable): void {
    this.tooltip.setItem(value);
  }

  public getTooltipElement(): HTMLElement {
    return this.tooltip.getElement();
  }

  public setPosition(setPositionParams: HandlerViewSetPositionParams): void {
    this.positionPart = setPositionParams.positionPart;
    this.updatePosition(setPositionParams);
  }

  @bind
  public updatePosition(
    { expandDimension, offsetDirection, workZoneLength }: HandlerViewUpdatePositionParams,
  ): void {
    const offset = this.calculateOffset(workZoneLength, expandDimension);

    this.element.wrap.style.removeProperty('left');
    this.element.wrap.style.removeProperty('top');

    this.element.wrap.style[offsetDirection] = `${offset}px`;
    this.tooltip.updateHTML();

    if (this.observers.updatePosition) {
      this.observers.updatePosition.callListeners();
    }
  }

  public setTooltipVisibility(stateToSet: boolean): void {
    this.tooltip.setVisibility(stateToSet);
  }

  public calculateDistanceToMouse(mouseCoordinate: number, sliderIsVertical: boolean): number {
    return Math.abs(this.getPositionCoordinate(sliderIsVertical) - mouseCoordinate);
  }

  public remove(): void {
    this.element.wrap.remove();
  }

  private initProperties({ rangePair, positionPart }: HandlerViewParams): void {
    this.pair = rangePair ?? null;
    this.positionPart = positionPart;
  }

  private createElement(parentElement: HTMLElement): void {
    const wrap = document.createElement('div');
    const body = document.createElement('div');

    this.element = { wrap, body };
    this.element.body.setAttribute('tabindex', '-1');

    wrap.classList.add(`${HandlerView.DEFAULT_CLASS}-container`);
    wrap.classList.add(...this.additionalClasses);
    parentElement.appendChild(wrap);

    body.classList.add(`${HandlerView.DEFAULT_CLASS}-body`);
    wrap.appendChild(body);
  }

  private calculateOffset(workZoneLength: number, expandDimension: ExpandDimension): number {
    const shift = workZoneLength * this.positionPart;

    const handlerSize = this.getSize(expandDimension);
    const tooltipSize = this.tooltip.getSize(expandDimension);
    const tooltipExcess = Math.max(0, tooltipSize - handlerSize);

    return shift - 0.5 * tooltipExcess;
  }
}

export default HandlerView;
