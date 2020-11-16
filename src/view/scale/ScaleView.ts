import { Slider } from '../interfaces';
import { clamp } from '../../utils/functions';

class ScaleView {
  private readonly parentSlider: Slider;

  private readonly bodyElement: HTMLElement;

  constructor(parentSlider: Slider, bodyElement: HTMLElement) {
    this.parentSlider = parentSlider;
    this.bodyElement = bodyElement;
  }

  public getStart(): number {
    return this.parentSlider.getIsVertical()
      ? this.bodyElement.getBoundingClientRect().top
      : this.bodyElement.getBoundingClientRect().left;
  }

  public getEnd(): number {
    return this.parentSlider.getIsVertical()
      ? this.bodyElement.getBoundingClientRect().bottom
      : this.bodyElement.getBoundingClientRect().right;
  }

  public getBorderWidth(): number {
    return Number.parseFloat(
      getComputedStyle(this.bodyElement)
        .getPropertyValue(`border-${this.parentSlider.getOffsetDirection()}-width`),
    );
  }

  public getLength(): number {
    return this.bodyElement.getBoundingClientRect()[this.parentSlider.getExpandDimension()];
  }

  public calculateMouseRelativePosition(mouseEvent: MouseEvent): number {
    const mouseCoordinate = this.parentSlider.getIsVertical()
      ? mouseEvent.clientY : mouseEvent.clientX;
    const initialOffset = this.parentSlider.getHandlerSize() / 2;
    const scaledCoordinate = (mouseCoordinate - this.getStart() - initialOffset)
      / this.parentSlider.calculateShrinkRatio();

    return clamp((scaledCoordinate) / this.getLength(), 0, 1);
  }

  public getWorkZoneLength(): number {
    const handlerSize = this.parentSlider.getHandlerSize();
    const scaleSize = this.getLength();
    return scaleSize - handlerSize;
  }

  public calculateShrinkRatio(): number {
    return this.getWorkZoneLength() / this.getLength();
  }
}

export default ScaleView;
