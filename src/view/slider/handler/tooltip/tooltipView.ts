import { DEFAULT_SLIDER_CLASS } from '../../../../utils/common';
import { Presentable } from '../../../../utils/types';
import { SliderElement } from '../../../../utils/interfaces';

export default class TooltipView {
    private _value: Presentable;

    set value(value: Presentable) {
      this._value = value;
      this.innerHTML = value;
    }

    get value(): Presentable {
      return this._value;
    }

    private _innerHTML = '';

    set innerHTML(value: Presentable) {
      this._innerHTML = `${value}`;
      this.updateHTML();
    }

    private _element: HTMLElement;

    get element(): HTMLElement {
      return this._element;
    }

    public static readonly DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__handlerTooltip`;

    get width(): number {
      return this.element.getBoundingClientRect().width;
    }

    get height(): number {
      return this.element.getBoundingClientRect().height;
    }

    private _isSliderVertical(): boolean {
      return this.parentHandler.ownerSlider.isVertical;
    }

    public getSize(): number {
      if (this._isSliderVertical()) { return this.height; }
      return this.width;
    }

    constructor(parentElement: HTMLElement,
                public parentHandler: SliderElement,
                params?: {
                    bodyHTML?: string;
                    item: Presentable;
                    visibilityState?: boolean;
                }) {
      const defaultParameters = this._initDefaultParameters();
      const parameters = { ...defaultParameters, ...params };
      this._createElement(parentElement);
      this.value = parameters.item;
      this.setVisibility(
        (parameters.visibilityState !== undefined) ? parameters.visibilityState : true,
      );
    }

    public setVisibility(visibilityState: boolean): void {
      if (visibilityState) this._show(); else this._hide();
    }

    public updateHTML(): void {
      this._element.innerHTML = this._innerHTML;
    }

    private _initDefaultParameters(): {
      additionalClasses: string[]; bodyHTML: string; withTooltip: boolean; isEnd: boolean;} {
      return {
        additionalClasses: [] as string[],
        bodyHTML: this._innerHTML,
        withTooltip: true,
        isEnd: true,
      };
    }

    private _show(): void {
      this._element.classList.add(`${TooltipView.DEFAULT_CLASS}_visible`);
      this._element.classList.remove(`${TooltipView.DEFAULT_CLASS}_hidden`);
    }

    private _hide(): void {
      this._element.classList.add(`${TooltipView.DEFAULT_CLASS}_hidden`);
      this._element.classList.remove(`${TooltipView.DEFAULT_CLASS}_visible`);
    }

    private _createElement(parentElement: HTMLElement): void {
      const orientationClass = this.parentHandler.ownerSlider.getOrientationClass();

      this._element = document.createElement('div');
      this._element.classList.add(`${TooltipView.DEFAULT_CLASS}`, orientationClass);
      this._element.innerHTML = this._innerHTML;

      parentElement.appendChild(this._element);
    }
}
