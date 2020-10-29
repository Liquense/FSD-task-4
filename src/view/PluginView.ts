import { Listenable } from '../interfaces';

import { HandlerModelParams, PositioningParams } from '../model/types';

import { View } from './interfaces';
import SliderView from './slider/SliderView';
import { SliderViewParams } from './types';

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

  public getViewData(): SliderViewParams {
    return {
      isVertical: this.slider.getIsVertical(),
      isTooltipsVisible: this.slider.getIsTooltipsAlwaysVisible(),
      isInverted: this.slider.getIsInverted(),
      withMarkup: this.slider.getWithMarkup(),
    };
  }

  public handleHandlerPositionChanged(
    handlerIndex: number,
    standardizedPosition: number,
  ): { view: View; handlerIndex: number; positionPart: number } {
    return { view: this, handlerIndex, positionPart: standardizedPosition };
  }

  public handlerValueChangedListener(data: HandlerModelParams): void {
    this.slider.setHandlersData([data]);
  }

  public initHandlers(handlersData: {
      customHandlers: boolean;
      handlersArray: HandlerModelParams[];
  }): void {
    this.slider.initHandlers(handlersData);
    this.slider.createRanges();
  }

  public updateVisuals(parameters?: SliderViewParams): void {
    this.slider.update(parameters);
  }

  public updateData(positioningData: PositioningParams): void {
    this.slider.update(positioningData);
  }

  public addHandler(handlerParams: HandlerModelParams & { rangePair: number | string }): void {
    this.slider.addHandler(handlerParams);
  }

  public removeHandler(handlerIndex: number): void {
    this.slider.removeHandler(handlerIndex);
  }
}

export default PluginView;
