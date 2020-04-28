import { DEFAULT_SLIDER_CLASS } from '../../../utils/common';
import { KeyStringObj } from '../../../utils/types';
import { Orientable, ScaleOwner, SliderContainer } from '../../../utils/interfaces';

export default class MarkupView {
  public wrap: HTMLElement = undefined;

  private _marks: HTMLElement[] = [];

  private static _DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__markup`;

  constructor(
      public ownerSlider: Orientable & ScaleOwner & SliderContainer,
  ) {
    this._createWrap();
  }

  public clearAllMarks(): void {
    this._marks = [];
    this.wrap.innerHTML = '';
  }

  public addMark(relativePosition: number, relativeHandlerSize: number): void {
    const newMark = this._createMarkElement();
    this._marks.push(newMark);

    const markOffset = this._calculateMarkOffset(relativePosition, relativeHandlerSize);
    (newMark.style as KeyStringObj)[this.ownerSlider.offsetDirection] = `${markOffset}%`;
  }

  private _getMarkThickness(): number {
    const dimension = this.ownerSlider.expandDimension;
    return (this._marks[0].getBoundingClientRect() as KeyStringObj)[dimension];
  }

  private _getRelativeMarkThickness(): number {
    const relativeMarkThickness = this.ownerSlider.shrinkRatio
      * (this._getMarkThickness() / this.ownerSlider.getScaleLength());

    return this.ownerSlider.getScaleLength() ? relativeMarkThickness : 0;
  }

  private _createWrap(): void {
    this.wrap = document.createElement('div');

    this.wrap.classList.add(`${MarkupView._DEFAULT_CLASS}Wrap`, this.ownerSlider.getOrientationClass());

    this.ownerSlider.bodyElement.insertBefore(this.wrap, this.ownerSlider.handlersContainer);
  }

  private _createMarkElement(): HTMLElement {
    const newMark = document.createElement('div');
    newMark.classList.add(MarkupView._DEFAULT_CLASS, this.ownerSlider.getOrientationClass());
    this.wrap.appendChild(newMark);

    return newMark;
  }

  private _calculateMarkOffset(relativePosition: number, relativeHandlerSize: number): number {
    // поправка на толщину деления шкалы
    const relativeMarkThicknessHalf = (this._getRelativeMarkThickness() / 2);
    // изначальный отступ по краям шкалы
    const relativeHandlerSizeHalf = (relativeHandlerSize / 2);

    return Number(
      (
        100 * (relativePosition + relativeHandlerSizeHalf - relativeMarkThicknessHalf)
      ).toFixed(4),
    );
  }
}
