import { DEFAULT_SLIDER_CLASS } from '../../../utils/common';
import {
  KeyStringObj, Orientable, ScaleOwner, SliderContainer,
} from '../../../utils/interfacesAndTypes';


export default class MarkupView {
  public wrap: HTMLElement = undefined;

  private marks: HTMLElement[] = [];

  private static DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__markup`;

  constructor(
      public ownerSlider: Orientable & ScaleOwner & SliderContainer,
  ) {
    this.createWrap();
  }

  public clearAllMarks(): void {
    this.marks = [];
    this.wrap.innerHTML = '';
  }

  public addMark(relativePosition: number, relativeHandlerSize: number): void {
    const newMark = this.createMarkElement();
    this.marks.push(newMark);

    const markOffset = this.calculateMarkOffset(relativePosition, relativeHandlerSize);
    (newMark.style as KeyStringObj)[this.ownerSlider.getOffsetDirection()] = `${markOffset}%`;
  }

  private getMarkThickness(): number {
    const dimension = this.ownerSlider.getExpandDimension();
    return (this.marks[0].getBoundingClientRect() as KeyStringObj)[dimension];
  }

  private getRelativeMarkThickness(): number {
    const relativeMarkThickness = this.ownerSlider.calculateShrinkRatio()
      * (this.getMarkThickness() / this.ownerSlider.getScaleLength());

    return this.ownerSlider.getScaleLength() ? relativeMarkThickness : 0;
  }

  private createWrap(): void {
    this.wrap = document.createElement('div');

    this.wrap.classList.add(`${MarkupView.DEFAULT_CLASS}Wrap`, this.ownerSlider.getOrientationClass());

    this.ownerSlider
      .getBodyElement()
      .insertBefore(this.wrap, this.ownerSlider.getHandlersContainer());
  }

  private createMarkElement(): HTMLElement {
    const newMark = document.createElement('div');
    newMark.classList.add(MarkupView.DEFAULT_CLASS, this.ownerSlider.getOrientationClass());
    this.wrap.appendChild(newMark);

    return newMark;
  }

  private calculateMarkOffset(relativePosition: number, relativeHandlerSize: number): number {
    const relativeMarkThicknessHalf = this.getRelativeMarkThickness() / 2;
    const relativeHandlerSizeHalf = relativeHandlerSize / 2;

    return Number(
      (
        100 * (relativePosition + relativeHandlerSizeHalf - relativeMarkThicknessHalf)
      ).toFixed(4),
    );
  }
}
