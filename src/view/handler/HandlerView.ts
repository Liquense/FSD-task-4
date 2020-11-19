import { DEFAULT_SLIDER_CLASS } from '../../constants';
import { Presentable } from '../../utils/types';

import { calculateElementCenter } from '../../utils/functions';

import { Slider, SliderElement } from '../interfaces';
import { HandlerPair, HandlerViewParams } from '../types';

import TooltipView from './tooltip/TooltipView';
import { Observable, Observer } from '../../utils/Observer/Observer';

class HandlerView implements Observable, SliderElement {
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

  constructor(private ownerSlider: Slider, params: HandlerViewParams) {
    this.initProperties(params);
    this.createElement(ownerSlider.getHandlersContainer());

    this.index = params.handlerIndex;
    this.tooltip = new TooltipView(
      this.element.wrap,
      this,
      { isVisible: params.isTooltipVisible ?? true, item: params.item },
    );
    this.setItem(params.item);
  }

  public getOwnerSlider(): Slider {
    return this.ownerSlider;
  }

  public getPositionCoordinate(): number {
    const elementCenter = calculateElementCenter(this.element.body);
    return this.ownerSlider.getIsVertical() ? elementCenter.y : elementCenter.x;
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

  public getSize(dimension?: 'width' | 'height'): number {
    const expandDimension = dimension ?? this.ownerSlider.getExpandDimension();
    return this.element.body.getBoundingClientRect()[expandDimension];
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

  public updatePosition = (): void => {
    const offset = this.calculateOffset();
    const offsetDirection = this.ownerSlider.getOffsetDirection();

    this.element.wrap.style.removeProperty('left');
    this.element.wrap.style.removeProperty('top');

    this.element.wrap.style[offsetDirection] = `${offset}px`;
    this.tooltip.updateHTML();

    if (this.observers.updatePosition) {
      this.observers.updatePosition.callListeners();
    }
  }

  public setPosition(newPositionPart: number): void {
    this.positionPart = newPositionPart;
    this.updatePosition();
  }

  public setTooltipVisibility(stateToSet: boolean): void {
    this.tooltip.setVisibility(stateToSet);
  }

  public calculateDistanceToMouse(mouseCoordinate: number): number {
    return Math.abs(this.getPositionCoordinate() - mouseCoordinate);
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

  private calculateOffset(): number {
    const shift = this.ownerSlider.getWorkZoneLength() * this.positionPart;

    const handlerSize = this.getSize();
    const tooltipSize = this.tooltip.getSize();
    const tooltipExcess = Math.max(0, tooltipSize - handlerSize);

    return shift - 0.5 * tooltipExcess;
  }
}

export default HandlerView;
