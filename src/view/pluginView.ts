import { Listenable } from '../interfaces';
import { Presentable } from '../types';

import { View } from './interfaces';

import SliderView from './slider/sliderView';

export default class PluginView implements Listenable, View {
  listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

  private readonly element: HTMLElement;

  private slider: SliderView;

  constructor(element: HTMLElement, parameters?: object) {
    this.element = element;
    this.slider = new SliderView(this, parameters);
  }

  public getBody(): HTMLElement {
    return this.element;
  }

  public handleHandlerPositionChanged(
    handlerIndex: number,
    standardizedPosition: number,
  ): { view: View; index: number; position: number } {
    return { view: this, index: handlerIndex, position: standardizedPosition };
  }

  public handlersValuesChangedListener(
    data: { index: number; relativeValue: number; item: Presentable },
  ): void {
    this.slider.setHandlersData([data]);
  }

  public initHandlers(handlersData: {
      customHandlers: boolean;
      handlersArray: {
          handlerIndex: number;
          positionPart: number;
          item: Presentable;
      }[];
  }): void {
    this.slider.initHandlers(handlersData);
    this.slider.createRanges();
  }

  public updateVisuals(parameters?: {
      isVertical?: boolean; tooltipsVisible?: boolean; withMarkup?: boolean;
  }): void {
    this.slider.update(parameters);
  }

  public updateData(sliderData: { min?: number; max?: number; step?: number }): void {
    this.slider.update(sliderData);
  }

  public addHandler(handlerParams: {
      positionPart: number;
      item: Presentable;
      handlerIndex: number;
      itemIndex: number;
      rangePair: number | string;
  }): void {
    this.slider.addHandler(handlerParams);
  }

  public removeHandler(handlerIndex: number): void {
    this.slider.removeHandler(handlerIndex);
  }
}
