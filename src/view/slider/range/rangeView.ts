import { DEFAULT_SLIDER_CLASS, HANDLER_PAIR_OPTIONS } from '../../../constants';

import {
  addListenerAfter,
  removeListener,
} from '../../../utils/functions';
import { KeyStringObj, Orientable, ScaleOwner } from '../../../utils/interfacesAndTypes';

import HandlerView from '../handler/handlerView';

export default class RangeView {
  private startHandler: HandlerView;

  private endHandler: HandlerView;

  private static readonly DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__range`;

  private element: HTMLElement;

  constructor(
    private parentSlider: Orientable & ScaleOwner,
    public parentElement: HTMLElement,
    firstHandler: HandlerView,
    secondHandler?: HandlerView,
  ) {
    if (secondHandler) {
      this.arrangeHandlers(firstHandler, secondHandler);
    } else {
      this.startHandler = HANDLER_PAIR_OPTIONS.get(firstHandler.getRangePair())
        ? firstHandler : null;
      this.endHandler = HANDLER_PAIR_OPTIONS.get(firstHandler.getRangePair())
        ? null : firstHandler;
    }

    this.createElement();
    requestAnimationFrame(this.refreshPosition.bind(this));
    if (this.startHandler) {
      addListenerAfter(
        'refreshPosition', this.refreshPosition, this.startHandler,
      );
    }
    if (this.endHandler) {
      addListenerAfter(
        'refreshPosition', this.refreshPosition, this.endHandler,
      );
    }
  }

  public getStartHandler(): HandlerView {
    return this.startHandler;
  }

  public getEndHandler(): HandlerView {
    return this.endHandler;
  }

  public refreshPosition = (): void => {
    const { parentSlider } = this;

    const firstCoordinate = this.startHandler
      ? this.startHandler.getPositionCoordinate() - parentSlider.getScaleStart()
      : parentSlider.getScaleBorderWidth();
    const secondCoordinate = this.endHandler
      ? this.endHandler.getPositionCoordinate() - parentSlider.getScaleStart()
      : parentSlider.getScaleEnd()
      - parentSlider.getScaleStart()
      - parentSlider.getScaleBorderWidth();

    const startCoordinate = Math.min(firstCoordinate, secondCoordinate);
    const endCoordinate = Math.max(firstCoordinate, secondCoordinate);

    const offset = startCoordinate;
    const length = endCoordinate - startCoordinate;

    this.clearPositionStyles();

    (this.element.style as KeyStringObj)[parentSlider.getOffsetDirection()] = `${offset}px`;
    (this.element.style as KeyStringObj)[parentSlider.getExpandDimension()] = `${length}px`;
  }

  public hasHandler(handler: HandlerView): boolean {
    return handler === this.startHandler || handler === this.endHandler;
  }

  public remove(): void {
    removeListener(
      'refreshPosition', this.refreshPosition, this.startHandler,
    );
    removeListener('refreshPosition', this.refreshPosition, this.endHandler);
    this.element.remove();
  }

  private clearPositionStyles(): void {
    this.element.style.removeProperty('left');
    this.element.style.removeProperty('top');
    this.element.style.removeProperty('width');
    this.element.style.removeProperty('height');
  }

  private createElement(): void {
    const body = document.createElement('div');

    this.element = body;
    body.classList.add(`${RangeView.DEFAULT_CLASS}`);

    this.parentElement.appendChild(body);
  }

  private arrangeHandlers(firstHandler: HandlerView, secondHandler: HandlerView): void {
    if (firstHandler.getPositionPart() <= secondHandler.getPositionPart()) {
      this.startHandler = firstHandler;
      this.endHandler = secondHandler;
    } else {
      this.startHandler = secondHandler;
      this.endHandler = firstHandler;
    }
  }
}
