import { DEFAULT_SLIDER_CLASS } from '../../constants';

import { Slider } from '../interfaces';
import { roundToDecimal, standardize } from '../../utils/functions';

class MarkupView {
  private wrap: HTMLElement;

  private marks: HTMLElement[] = [];

  private static DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__markup`;

  constructor(private ownerSlider: Slider) {
    this.createWrap();
  }

  public getWrap(): HTMLElement {
    return this.wrap;
  }

  public createMarks(): void {
    const stepPart = this.ownerSlider.getStepPart();
    for (let i = 0; i <= 1; i = roundToDecimal(i + stepPart, 5)) {
      const standardPosition = standardize(i, { min: 0, max: 1, step: stepPart });
      const shrinkPosition = standardPosition * this.ownerSlider.calculateShrinkRatio();
      this.addMark(shrinkPosition, this.ownerSlider.calculateRelativeHandlerSize());
    }
  }

  public clearAllMarks(): void {
    this.marks = [];
    this.wrap.innerHTML = '';
  }

  public addMark(relativePosition: number, relativeHandlerSize: number): void {
    const newMark = this.createMarkHTML();
    this.marks.push(newMark);

    const markOffset = this.calculateMarkOffset(relativePosition, relativeHandlerSize);
    const offsetDirection = this.ownerSlider.getOffsetDirection();
    newMark.style[offsetDirection] = `${markOffset}%`;
  }

  private getMarkThickness(): number {
    const dimension = this.ownerSlider.getExpandDimension();
    return this.marks[0].getBoundingClientRect()[dimension];
  }

  private getRelativeMarkThickness(): number {
    const relativeMarkThickness = this.ownerSlider.calculateShrinkRatio()
      * (this.getMarkThickness() / this.ownerSlider.getScaleLength());

    return this.ownerSlider.getScaleLength() ? relativeMarkThickness : 0;
  }

  private createWrap(): void {
    this.wrap = document.createElement('div');

    this.wrap.classList.add(`${MarkupView.DEFAULT_CLASS}-wrap`);

    this.ownerSlider
      .getBodyElement()
      .insertBefore(this.wrap, this.ownerSlider.getHandlersContainer());
  }

  private createMarkHTML(): HTMLElement {
    const newMark = document.createElement('div');
    newMark.classList.add(MarkupView.DEFAULT_CLASS);
    this.wrap.appendChild(newMark);

    return newMark;
  }

  private calculateMarkOffset(relativePosition: number, relativeHandlerSize: number): number {
    const relativeMarkThicknessHalf = this.getRelativeMarkThickness() / 2;
    const relativeHandlerSizeHalf = relativeHandlerSize / 2;

    return Number(
      (100 * (relativePosition + relativeHandlerSizeHalf - relativeMarkThicknessHalf))
        .toFixed(4),
    );
  }
}

export default MarkupView;
