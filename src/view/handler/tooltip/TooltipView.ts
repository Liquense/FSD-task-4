import { DEFAULT_SLIDER_CLASS } from '../../../shared/constants';
import { Presentable } from '../../../utils/types';

import { ExpandDimension } from '../../types';

import { TooltipViewParams } from './types';

class TooltipView {
  public static readonly DEFAULT_CLASS = `${DEFAULT_SLIDER_CLASS}__handler-tooltip`;

  public static readonly DEFAULT_VISIBLE_CLASS = `${TooltipView.DEFAULT_CLASS}_visible`;

  public static readonly DEFAULT_HIDDEN_CLASS = `${TooltipView.DEFAULT_CLASS}_hidden`;

  private static readonly DEFAULT_PARAMETERS = {
    bodyHTML: '',
    withTooltip: true,
    isEnd: true,
  };

  private item: Presentable;

  private innerHTML = '';

  private element: HTMLElement;

  constructor(
    parentElement: HTMLElement,
    params?: TooltipViewParams,
  ) {
    this.createElement(parentElement);
    this.initProperties(params);
  }

  public getSize(dimension: ExpandDimension): number {
    return this.element.getBoundingClientRect()[dimension];
  }

  public getItem(): Presentable {
    return this.item;
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public setItem(value: Presentable): void {
    this.item = value;
    this.updateHTML();
  }

  public setVisibility(visibilityState: boolean): void {
    if (visibilityState) this.show();
    else this.hide();
  }

  private updateHTML(): void {
    this.innerHTML = `${this.item}`;
    this.element.innerHTML = this.innerHTML;
  }

  private initProperties(parameters: TooltipViewParams): void {
    const mergedParameters = { ...TooltipView.DEFAULT_PARAMETERS, ...parameters };
    this.setItem(mergedParameters.item);

    this.setVisibility(mergedParameters.isVisible ?? true);
  }

  private show(): void {
    this.element.classList.add(TooltipView.DEFAULT_VISIBLE_CLASS);
    this.element.classList.remove(TooltipView.DEFAULT_HIDDEN_CLASS);
  }

  private hide(): void {
    this.element.classList.add(TooltipView.DEFAULT_HIDDEN_CLASS);
    this.element.classList.remove(TooltipView.DEFAULT_VISIBLE_CLASS);
  }

  private createElement(parentElement: HTMLElement): void {
    this.element = document.createElement('div');
    this.element.classList.add(`${TooltipView.DEFAULT_CLASS}`);
    this.element.innerHTML = this.innerHTML;

    parentElement.appendChild(this.element);
  }
}

export default TooltipView;
