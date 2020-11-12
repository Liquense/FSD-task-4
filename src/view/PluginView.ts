import { HandlerModelData, PositioningParams } from '../model/types';

import { View } from './interfaces';
import SliderView from './slider/SliderView';
import {
  HandlerPositionData,
  HandlersViewData, SliderViewUpdateParams,
} from './types';
import { Observable, Observer } from '../utils/Observer/Observer';

class PluginView implements Observable, View {
  observers: { [key: string]: Observer } = {};

  private readonly element: HTMLElement;

  private readonly slider: SliderView;

  constructor(element: HTMLElement, parameters?: object) {
    this.element = element;
    this.slider = new SliderView(this, parameters);
    this.initDefaultListeners();
  }

  public getBody(): HTMLElement {
    return this.element;
  }

  private initDefaultListeners(): void {
    Observer.addListener('handleMouseMove', this.slider, this.handleHandlerPositionChanged);
  }

  public handleHandlerPositionChanged = ({ handlerIndex, position }: HandlerPositionData): {
    handlerIndex: number; positionPart: number;
  } => {
    if (handlerIndex === null || position === null) { return null; }

    const result = { handlerIndex, positionPart: position };
    if (this.observers.handleHandlerPositionChanged) {
      this.observers.handleHandlerPositionChanged.callListeners(result);
    }
    return result;
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
