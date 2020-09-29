import { calculateElementCenter, DEFAULT_SLIDER_CLASS } from '../../../utils/common';
import TooltipView from './tooltip/tooltipView';
import {
  KeyStringObj, Presentable,
  Listenable,
  SliderElement, Slider,
} from '../../../utils/interfacesAndTypes';

export default class HandlerView implements Listenable, SliderElement {
  public readonly tooltip: TooltipView;

  public listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

  public index: number;

  public positionPart: number;

  public element: {
    wrap: HTMLElement;
    body: HTMLElement;
  };

  public rangePair: number | string;

  private static DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__handler`;

  private additionalClasses: string[] = [];

  constructor(
    private ownerSlider: Slider,
    params:
      {
        handlerIndex: number;
        positionPart: number;
        item: Presentable;
        withTooltip?: boolean;
        rangePair?: number | string;
      },
  ) {
    this.rangePair = params.rangePair;
    this.index = params.handlerIndex;
    this.positionPart = params.positionPart;

    this.createElement(ownerSlider.getHandlersContainer());

    const withTooltip = params.withTooltip === undefined ? true : params.withTooltip;
    this.tooltip = new TooltipView(
      this.element.wrap, this, { visibilityState: withTooltip, item: params.item },
    );
    this.setValue(params.item);

    requestAnimationFrame(this.refreshPosition.bind(this));
  }

  public getOwnerSlider(): Slider {
    return this.ownerSlider;
  }

  public getPositionCoordinate(): number {
    const elementCenter = calculateElementCenter(this.element.body);
    return this.ownerSlider.getIsVertical() ? elementCenter.y : elementCenter.x;
  }

  public getBody(): HTMLElement {
    return this.element.body;
  }

  public getSize(dimension?: 'width' | 'height'): number {
    return (this.element.body.getBoundingClientRect() as KeyStringObj)[
      dimension ?? this.ownerSlider.getExpandDimension()
    ];
  }

  public getValue(): Presentable {
    return this.tooltip.getValue();
  }

  public setValue(value: Presentable): void {
    this.tooltip.setValue(value);
  }

  public calculateOffset(): number {
    return this.ownerSlider.calculateHandlerOffset(this.positionPart);
  }

  public getTooltipElement(): HTMLElement {
    return this.tooltip.getElement();
  }

  public refreshPosition(): void {
    const offset = this.calculateAccurateOffset();

    this.element.wrap.style.removeProperty('left');
    this.element.wrap.style.removeProperty('top');

    (this.element.wrap.style as KeyStringObj)[this.ownerSlider.getOffsetDirection()] = `${offset}px`;
    this.tooltip.updateHTML();
  }

  public setPosition(newPositionPart: number): void {
    this.positionPart = newPositionPart;
    if (this.element) {
      this.refreshPosition();
    }
  }

  public setTooltipVisibility(stateToSet: boolean): void {
    this.tooltip.setVisibility(stateToSet);
  }

  public remove(): void {
    this.element.wrap.remove();
  }

  private createElement(parentElement: HTMLElement): void {
    const wrap = document.createElement('div');
    const body = document.createElement('div');
    const orientationClass = this.ownerSlider.getOrientationClass();

    this.element = { wrap, body };
    this.element.body.setAttribute('tabindex', '-1');

    wrap.classList.add(`${HandlerView.DEFAULT_CLASS}Container`, orientationClass);
    wrap.classList.add(...this.additionalClasses);
    parentElement.appendChild(wrap);

    body.classList.add(`${HandlerView.DEFAULT_CLASS}Body`, orientationClass);
    wrap.appendChild(body);
  }

  /**
   * Добавляет смещение для правильного отображения хэндлера и тултипа, если тултип больше
   * @param shift
   * @private
   */
  private centerShift(shift: number): number {
    const handlerSize = this.getSize();
    const tooltipSize = this.tooltip.getSize();

    const tooltipExcess = Math.max(0, tooltipSize - handlerSize);

    return (shift - 0.5 * tooltipExcess);
  }

  private calculateAccurateOffset(): number {
    const shift = this.calculateOffset();

    return this.centerShift(shift);
  }
}
