import { DEFAULT_SLIDER_CLASS } from '../../../constants';
import { Listenable } from '../../../interfaces';
import { KeyStringObj, Presentable } from '../../../types';

import { calculateElementCenter } from '../../../utils/functions';

import { SliderElement } from '../../interfaces';
import { HandlerViewParams, Slider } from '../../types';

import TooltipView from './tooltip/tooltipView';

export default class HandlerView implements Listenable, SliderElement {
  public listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

  private readonly tooltip: TooltipView;

  private readonly index: number;

  private positionPart: number;

  private element: {
    wrap: HTMLElement;
    body: HTMLElement;
  };

  private rangePair: number | string;

  private static DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__handler`;

  private additionalClasses: string[] = [];

  constructor(
    private ownerSlider: Slider,
    params: HandlerViewParams,
  ) {
    this.initProperties(params);
    this.createElement(ownerSlider.getHandlersContainer());

    this.index = params.handlerIndex;
    this.tooltip = new TooltipView(
      this.element.wrap, this, { visibilityState: params.withTooltip ?? true, item: params.item },
    );
    this.setItem(params.item);

    requestAnimationFrame(this.refreshPosition.bind(this));
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

  public getRangePair(): number | string {
    return this.rangePair;
  }

  public setRangePair(rangePair: number | string): void {
    this.rangePair = rangePair;
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
    return (this.element.body.getBoundingClientRect() as KeyStringObj)[
      dimension ?? this.ownerSlider.getExpandDimension()
    ];
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

  public refreshPosition(): void {
    const offset = this.calculateOffset();

    this.element.wrap.style.removeProperty('left');
    this.element.wrap.style.removeProperty('top');

    (this.element.wrap.style as KeyStringObj)[this.ownerSlider.getOffsetDirection()] = `${offset}px`;
    this.tooltip.updateHTML();
  }

  public setPosition(newPositionPart: number): void {
    this.positionPart = newPositionPart;
    this.refreshPosition();
  }

  public setTooltipVisibility(stateToSet: boolean): void {
    this.tooltip.setVisibility(stateToSet);
  }

  public remove(): void {
    this.element.wrap.remove();
  }

  private initProperties({ rangePair, positionPart }: HandlerViewParams): void {
    this.rangePair = rangePair ?? null;
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
    const shift = this.ownerSlider.calculateHandlerOffset(this.positionPart);

    const handlerSize = this.getSize();
    const tooltipSize = this.tooltip.getSize();
    const tooltipExcess = Math.max(0, tooltipSize - handlerSize);

    return shift - 0.5 * tooltipExcess;
  }
}
