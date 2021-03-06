import { DEFAULT_SLIDER_CLASS } from '../../shared/constants';

import { standardize } from '../../utils/functions';
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
    const { stepPart, shrinkRatio } = markupParams;
    const marksAmount = Math.floor((1 / stepPart) + 1);
    new Array(marksAmount).fill(null).forEach((_, index) => {
      const standardPosition = standardize(index * stepPart, { min: 0, max: 1, step: stepPart });
      const shrinkPosition = standardPosition * shrinkRatio;
      this.addMark({ ...markupParams, ...{ relativePosition: shrinkPosition } });
    });
  }

  public clearAllMarks(): void {
    this.marks = [];
    this.wrap.innerHTML = '';
  }

  private createWrap(sliderBody: HTMLElement, handlersContainer: HTMLElement): void {
    this.wrap = document.createElement('div');
    this.wrap.classList.add(`${MarkupView.DEFAULT_CLASS}-wrap`);

    sliderBody.insertBefore(this.wrap, handlersContainer);
  }

  private addMark(markParams: MarkParams): void {
    const newMark = this.createMarkHTML();
    this.marks.push(newMark);

    const relativeMarkOffset = this.calculateMarkOffset(markParams);
    newMark.style[markParams.offsetDirection] = `${relativeMarkOffset}%`;
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
    { shrinkRatio, expandDimension, scaleLength }: MarkupParams,
  ): number {
    const relativeMarkThickness = shrinkRatio
      * (this.getMarkThickness(expandDimension) / scaleLength);
    return scaleLength ? relativeMarkThickness : 0;
  }
}

export default MarkupView;
