import { calculateElementCenter, DEFAULT_SLIDER_CLASS, Listenable } from '../../../utils/common';
import Tooltip from './__tooltip/tooltip';
import { KeyStringObj, Presentable } from '../../../utils/types';
import {
  HandlersOwner, Orientable, ScaleOwner, SliderContainer, SliderElement,
} from '../../../utils/interfaces';

export default class HandlerView implements Listenable, SliderElement {
    listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

    private static _DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__handler`;

    public readonly tooltip: Tooltip;

    private _additionalClasses: string[] = [];

    public index: number;

    public setValue(value: Presentable): void {
      this.tooltip.value = value;
    }

    get value(): Presentable {
      return this.tooltip.value;
    }

    get positionCoordinate(): number {
      return calculateElementCenter(this.element.body, this.ownerSlider.isVertical);
    }

    public positionPart: number;

    public element: {
        wrap: HTMLElement;
        body: HTMLElement;
    };

    get body(): HTMLElement {
      return this.element.body;
    }

    get width(): number {
      return this.element.body.getBoundingClientRect().width;
    }

    get height(): number {
      return this.element.body.getBoundingClientRect().height;
    }

    public rangePair: number | string;

    constructor(
        public ownerSlider: Orientable & SliderContainer & HandlersOwner & ScaleOwner,
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

      this._createElement(ownerSlider.handlersContainer);

      const withTooltip = params.withTooltip === undefined ? true : params.withTooltip;
      this.tooltip = new Tooltip(
        this.element.wrap, this, { visibilityState: withTooltip, item: params.item },
      );
      this.setValue(params.item);

      requestAnimationFrame(this.refreshPosition.bind(this));
    }

    private _createElement(parentElement: HTMLElement): void {
      const wrap = document.createElement('div');
      const body = document.createElement('div');
      const orientationClass = this.ownerSlider.getOrientationClass();

      this.element = { wrap, body };
      this.element.body.setAttribute('tabindex', '-1');

      wrap.classList.add(`${HandlerView._DEFAULT_CLASS}Container`, orientationClass);
      wrap.classList.add(...this._additionalClasses);
      parentElement.appendChild(wrap);

      body.classList.add(`${HandlerView._DEFAULT_CLASS}Body`, orientationClass);
      wrap.appendChild(body);
    }


    get size(): number {
      return (this as KeyStringObj)[this.ownerSlider.expandDimension];
    }

    public calculateOffset(): number {
      return this.ownerSlider.calculateHandlerOffset(this.positionPart);
    }

    // добавляется смещение для правильного отображения хэндлера и тултипа, если тултип больше
    private _centerShift(shift: number): number {
      const handlerSize = this.size;
      const tooltipSize = this.tooltip.getSize();

      const tooltipExcess = Math.max(0, tooltipSize - handlerSize);

      return (shift - 0.5 * tooltipExcess);
    }

    private _calculateAccurateOffset(): number {
      const shift = this.calculateOffset();

      return this._centerShift(shift);
    }

    public refreshPosition(): void {
      const offset = this._calculateAccurateOffset();

      this.element.wrap.style.removeProperty('left');
      this.element.wrap.style.removeProperty('top');

      (this.element.wrap.style as KeyStringObj)[this.ownerSlider.offsetDirection] = `${offset}px`;
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
}
