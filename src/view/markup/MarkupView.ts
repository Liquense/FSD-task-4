import { DEFAULT_SLIDER_CLASS } from '../../constants';

import { roundToDecimal, standardize } from '../../utils/functions';
import { ExpandDimension } from '../types';

import { MarkParams, MarkupParams } from './types';

class MarkupView {
  private wrap: HTMLElement;

  private marks: HTMLElement[] = [];

  private static DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__markup`;

  constructor(sliderBody: HTMLElement, handlersContainer: HTMLElement) {
    this.createWrap(sliderBody, handlersContainer);
  }

  public getWrap(): HTMLElement {
    return this.wrap;
  }

  public createMarks(markupParams: MarkupParams): void {
    for (let i = 0; i <= 1; i = roundToDecimal(i + markupParams.stepPart, 5)) {
      const standardPosition = standardize(i, { min: 0, max: 1, step: markupParams.stepPart });
      const shrinkPosition = standardPosition * markupParams.shrinkRatio;
      this.addMark({ ...markupParams, ...{ relativePosition: shrinkPosition } });
    }
  }

  private createWrap(sliderBody: HTMLElement, handlersContainer: HTMLElement): void {
    this.wrap = document.createElement('div');
    this.wrap.classList.add(`${MarkupView.DEFAULT_CLASS}-wrap`);

    sliderBody.insertBefore(this.wrap, handlersContainer);
  }

  public clearAllMarks(): void {
    this.marks = [];
    this.wrap.innerHTML = '';
  }

  private addMark(markParams: MarkParams): void {
    const newMark = this.createMarkHTML();
    this.marks.push(newMark);

    const markOffset = this.calculateMarkOffset(markParams);
    newMark.style[markParams.offsetDirection] = `${markOffset}%`;
  }

  private getMarkThickness(dimension: ExpandDimension): number {
    return this.marks[0].getBoundingClientRect()[dimension];
  }

  private createMarkHTML(): HTMLElement {
    const newMark = document.createElement('div');
    newMark.classList.add(MarkupView.DEFAULT_CLASS);
    this.wrap.appendChild(newMark);

    return newMark;
  }

  private calculateMarkOffset(markParams: MarkParams): number {
    const relativeMarkThicknessHalf = this.getRelativeMarkThickness(markParams) / 2;
    const relativeHandlerSizeHalf = markParams.relativeHandlerSize / 2;

    return Number(
      (100 * (markParams.relativePosition + relativeHandlerSizeHalf - relativeMarkThicknessHalf))
        .toFixed(4),
    );
  }

  private getRelativeMarkThickness(
    { shrinkRatio, expandDimension, scaleLength }: MarkParams,
  ): number {
    const relativeMarkThickness = shrinkRatio
      * (this.getMarkThickness(expandDimension) / scaleLength);
    return scaleLength ? relativeMarkThickness : 0;
  }
}

export default MarkupView;
