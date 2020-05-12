import HandlerView from '../handler/handlerView';
import {
  addListenerAfter,
  DEFAULT_SLIDER_CLASS,
  HANDLER_PAIR_OPTIONS,
  removeListener,
} from '../../../utils/common';
import { KeyStringObj } from '../../../utils/types';
import { Orientable, ScaleOwner } from '../../../utils/interfaces';

export default class RangeView {
  public startHandler: HandlerView;

  public endHandler: HandlerView;

  private static readonly _DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__range`;

  private _element: HTMLElement;

  private _handlerRefreshPositionName = 'refreshPosition';

  constructor(
    private parentSlider: Orientable & ScaleOwner,
    public parentElement: HTMLElement,
    firstHandler: HandlerView,
    secondHandler?: HandlerView,
  ) {
    if (secondHandler) {
      this._arrangeHandlers(firstHandler, secondHandler);
    } else {
      this.startHandler = HANDLER_PAIR_OPTIONS.get(firstHandler.rangePair)
        ? firstHandler : null;
      this.endHandler = HANDLER_PAIR_OPTIONS.get(firstHandler.rangePair)
        ? null : firstHandler;
    }

    this._createElement();
    requestAnimationFrame(this.refreshPosition.bind(this));
    // слушаем изменения хэндлеров, между которыми ренж
    if (this.startHandler) {
      addListenerAfter(
        this._handlerRefreshPositionName, this._boundRefreshPosition, this.startHandler,
      );
    }
    if (this.endHandler) {
      addListenerAfter(
        this._handlerRefreshPositionName, this._boundRefreshPosition, this.endHandler,
      );
    }
  }

  public refreshPosition(): void {
    const { parentSlider } = this;

    const firstCoordinate = this.startHandler
      ? this.startHandler.positionCoordinate - parentSlider.scaleStart
      : parentSlider.scaleBorderWidth;
    const secondCoordinate = this.endHandler
      ? this.endHandler.positionCoordinate - parentSlider.scaleStart
      : parentSlider.scaleEnd - parentSlider.scaleStart - parentSlider.scaleBorderWidth;

    const startCoordinate = Math.min(firstCoordinate, secondCoordinate);
    const endCoordinate = Math.max(firstCoordinate, secondCoordinate);

    const offset = startCoordinate;
    const length = endCoordinate - startCoordinate;

    this._element.style.removeProperty('left');
    this._element.style.removeProperty('top');
    this._element.style.removeProperty('width');
    this._element.style.removeProperty('height');


    (this._element.style as KeyStringObj)[parentSlider.offsetDirection] = `${offset}px`;
    (this._element.style as KeyStringObj)[parentSlider.expandDimension] = `${length}px`;
  }

  public hasHandler(handler: HandlerView): boolean {
    return handler === this.startHandler || handler === this.endHandler;
  }

  public remove(): void {
    removeListener(
      this._handlerRefreshPositionName, this._boundRefreshPosition, this.startHandler,
    );
    removeListener(this._handlerRefreshPositionName, this._boundRefreshPosition, this.endHandler);
    this._element.remove();
  }

  private _createElement(): void {
    const body = document.createElement('div');
    const orientationClass = this.parentSlider.getOrientationClass();

    this._element = body;
    body.classList.add(`${RangeView._DEFAULT_CLASS}`, orientationClass);

    this.parentElement.appendChild(body);
  }

  private _boundRefreshPosition = this.refreshPosition.bind(this);

  private _arrangeHandlers(firstHandler: HandlerView, secondHandler: HandlerView): void {
    if (firstHandler.positionPart <= secondHandler.positionPart) {
      this.startHandler = firstHandler;
      this.endHandler = secondHandler;
    } else {
      this.startHandler = secondHandler;
      this.endHandler = firstHandler;
    }
  }
}
