import { Listenable } from '../utils/interfaces';

import { HandlerModelData, PositioningParams } from '../model/types';

import { View } from './interfaces';
import SliderView from './slider/SliderView';
import {
  HandlersViewData, SliderViewUpdateParams,
} from './types';

class PluginView implements Listenable, View {
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
  ): { view: View; handlerIndex: number; positionPart: number } {
    return { view: this, handlerIndex, positionPart: standardizedPosition };
  }

  public handlerValueChangedListener(data: HandlerModelData): void {
    this.slider.setHandlersData([data]);
  }

  public initHandlers(handlersData: HandlersViewData): void {
    this.slider.initHandlers(handlersData);
    this.slider.createRanges();
  }

  public updateVisuals(parameters?: SliderViewUpdateParams): void {
    this.slider.update(parameters);
  }

  public updatePositioning(positioningData: PositioningParams): void {
    this.slider.update(positioningData);
  }

  public addHandler(handlerParams: HandlerModelData & { rangePair: number | string }): void {
    this.slider.addHandler(handlerParams);
  }

  public removeHandler(handlerIndex: number): void {
    this.slider.removeHandler(handlerIndex);
  }
}

export default PluginView;
