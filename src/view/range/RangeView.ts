import bind from 'bind-decorator';

import { DEFAULT_SLIDER_CLASS, RANGE_PAIR_OPTIONS } from '../../constants';

import HandlerView from '../handler/HandlerView';
import { RangeViewUpdateParams } from './types';

class RangeView {
  private startHandler: HandlerView;

  private endHandler: HandlerView;

  private static readonly DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__range`;

  private element: HTMLElement;

  constructor(
    public parentElement: HTMLElement,
    updateParams: RangeViewUpdateParams,
    firstHandler: HandlerView,
    secondHandler?: HandlerView,
  ) {
    this.initHandlers(firstHandler, secondHandler);
    this.createElement();
    this.updatePosition(updateParams);
  }

  public getStartHandler(): HandlerView {
    return this.startHandler;
  }

  public getEndHandler(): HandlerView {
    return this.endHandler;
  }

  @bind
  public updatePosition(
    {
      isVertical, scaleStart, scaleEnd, scaleBorderWidth, offsetDirection, expandDimension,
    }: RangeViewUpdateParams,
  ): void {
    const firstCoordinate = this.startHandler
      ? this.startHandler.getPositionCoordinate(isVertical) - scaleStart
      : scaleBorderWidth;
    const scaleLength = Math.abs(scaleStart - scaleEnd);
    const secondCoordinate = this.endHandler
      ? this.endHandler.getPositionCoordinate(isVertical) - scaleStart
      : scaleLength - scaleBorderWidth;

    const startCoordinate = Math.min(firstCoordinate, secondCoordinate);
    const endCoordinate = Math.max(firstCoordinate, secondCoordinate);
    const offset = startCoordinate;
    const length = endCoordinate - startCoordinate;

    this.clearPositionStyles();

    this.element.style[offsetDirection] = `${offset}px`;
    this.element.style[expandDimension] = `${length}px`;
  }

  public hasHandler(handler: HandlerView): boolean {
    return handler === this.startHandler || handler === this.endHandler;
  }

  public remove(): void {
    this.element.remove();
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
