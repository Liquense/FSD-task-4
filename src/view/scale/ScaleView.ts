import { clamp } from '../../utils/functions';
import { ExpandDimension, OffsetDirection, SliderViewData } from '../types';

class ScaleView {
  private readonly bodyElement: HTMLElement;

  constructor(bodyElement: HTMLElement) {
    this.bodyElement = bodyElement;
  }

  public getStart(isVertical: boolean): number {
    return isVertical
      ? this.bodyElement.getBoundingClientRect().top
      : this.bodyElement.getBoundingClientRect().left;
  }

  public getEnd(isVertical: boolean): number {
    return isVertical
      ? this.bodyElement.getBoundingClientRect().bottom
      : this.bodyElement.getBoundingClientRect().right;
  }

  public getBorderWidth(offsetDirection: OffsetDirection): number {
    return Number.parseFloat(
      getComputedStyle(this.bodyElement).getPropertyValue(`border-${offsetDirection}-width`),
    );
  }

  public getLength(expandDimension: ExpandDimension): number {
    return this.bodyElement.getBoundingClientRect()[expandDimension];
  }

  public calculateMouseRelativePosition(
    mouseEvent: MouseEvent, { isVertical, relativeHandlerSize, expandDimension }: SliderViewData,
  ): number {
    const mouseCoordinate = isVertical ? mouseEvent.clientY : mouseEvent.clientX;
    const initialOffset = relativeHandlerSize / 2;
    const scaledCoordinate = (mouseCoordinate - this.getStart(isVertical) - initialOffset)
      / this.calculateShrinkRatio(expandDimension, relativeHandlerSize);

    return clamp((scaledCoordinate) / this.getLength(expandDimension), 0, 1);
  }

  public getWorkZoneLength(expandDimension: ExpandDimension, handlerSize: number): number {
    const scaleSize = this.getLength(expandDimension);
    return scaleSize - handlerSize;
  }

  public calculateShrinkRatio(
    expandDimension: ExpandDimension, handlerSize: number,
  ): number {
    return this.getWorkZoneLength(expandDimension, handlerSize)
      / this.getLength(expandDimension);
  }
}

export default ScaleView;
