import { DEFAULT_SLIDER_CLASS, RANGE_PAIR_OPTIONS } from '../../constants';

import { Orientable, ScaleOwner } from '../interfaces';

import HandlerView from '../handler/HandlerView';
import { Observer } from '../../utils/Observer/Observer';

class RangeView {
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
    this.initHandlers(firstHandler, secondHandler);
    this.createElement();
    this.addHandlersRefreshListener();
    requestAnimationFrame(this.refreshPosition);
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
    const scaleLength = Math.abs(parentSlider.getScaleStart() - parentSlider.getScaleEnd());
    const secondCoordinate = this.endHandler
      ? this.endHandler.getPositionCoordinate() - parentSlider.getScaleStart()
      : scaleLength - parentSlider.getScaleBorderWidth();

    const startCoordinate = Math.min(firstCoordinate, secondCoordinate);
    const endCoordinate = Math.max(firstCoordinate, secondCoordinate);
    const offset = startCoordinate;
    const length = endCoordinate - startCoordinate;

    this.clearPositionStyles();

    this.element.style[parentSlider.getOffsetDirection()] = `${offset}px`;
    this.element.style[parentSlider.getExpandDimension()] = `${length}px`;
  }

  public hasHandler(handler: HandlerView): boolean {
    return handler === this.startHandler || handler === this.endHandler;
  }

  public remove(): void {
    Observer.removeListener('refreshPosition', this.startHandler, this.refreshPosition);
    Observer.removeListener('refreshPosition', this.endHandler, this.refreshPosition);
    this.element.remove();
  }

  private addHandlersRefreshListener(): void {
    if (this.startHandler) {
      Observer.addListener('refreshPosition', this.startHandler, this.refreshPosition);
    }
    if (this.endHandler) {
      Observer.addListener('refreshPosition', this.endHandler, this.refreshPosition);
    }
  }

  private initHandlers(firstHandler: HandlerView, secondHandler: HandlerView): void {
    if (secondHandler) {
      this.arrangeHandlers(firstHandler, secondHandler);
    } else {
      this.startHandler = RANGE_PAIR_OPTIONS.get(firstHandler.getPair())
        ? firstHandler : null;
      this.endHandler = RANGE_PAIR_OPTIONS.get(firstHandler.getPair())
        ? null : firstHandler;
    }
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

export default RangeView;
