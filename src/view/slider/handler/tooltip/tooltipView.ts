import { DEFAULT_SLIDER_CLASS } from '../../../../utils/common';
import {
  KeyStringObj,
  Presentable,
  SliderElement,
} from '../../../../utils/interfacesAndTypes';

type tooltipViewParams = {
  bodyHTML?: string;
  item: Presentable;
  visibilityState?: boolean;
};

export default class TooltipView {
  public static readonly DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__handlerTooltip`;

  private item: Presentable;

  private innerHTML = '';

  private element: HTMLElement;

  constructor(parentElement: HTMLElement,
              private ownerHandler: SliderElement,
              params?: tooltipViewParams) {
    const defaultParameters = this.initDefaultParameters();
    const parameters = { ...defaultParameters, ...params };

    this.item = parameters.item;

    this.createElement(parentElement);
    this.setVisibility(
      (parameters.visibilityState !== undefined) ? parameters.visibilityState : true,
    );
  }

  public getSize(dimension?: 'height' | 'width'): number {
    return (this.element.getBoundingClientRect() as KeyStringObj)[
      dimension ?? this.ownerHandler.getOwnerSlider().getExpandDimension()
    ];
  }

  public getValue(): Presentable {
    return this.item;
  }

  public setValue(value: Presentable): void {
    this.item = value;
    this.setInnerHTML(value);
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public setInnerHTML(value: Presentable): void {
    this.innerHTML = `${value}`;
    this.updateHTML();
  }

  public setVisibility(visibilityState: boolean): void {
    if (visibilityState) this.show(); else this.hide();
  }

  public updateHTML(): void {
    this.element.innerHTML = this.innerHTML;
  }

  private initDefaultParameters(): {
    bodyHTML: string; withTooltip: boolean; isEnd: boolean;
    } {
    return {
      bodyHTML: this.innerHTML,
      withTooltip: true,
      isEnd: true,
    };
  }

  private show(): void {
    this.element.classList.add(`${TooltipView.DEFAULT_CLASS}_visible`);
    this.element.classList.remove(`${TooltipView.DEFAULT_CLASS}_hidden`);
  }

  private hide(): void {
    this.element.classList.add(`${TooltipView.DEFAULT_CLASS}_hidden`);
    this.element.classList.remove(`${TooltipView.DEFAULT_CLASS}_visible`);
  }

  private createElement(parentElement: HTMLElement): void {
    const orientationClass = this.ownerHandler.getOwnerSlider().getOrientationClass();

    this.element = document.createElement('div');
    this.element.classList.add(`${TooltipView.DEFAULT_CLASS}`, orientationClass);
    this.element.innerHTML = this.innerHTML;

    parentElement.appendChild(this.element);
  }
}
