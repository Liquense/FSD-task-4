import PluginView from '../view/pluginView';
import SliderModel from '../model/sliderModel';
import { addListenerAfter } from '../utils/functions';
import { View } from '../view/interfaces';
import { Listenable } from '../interfaces';
import { Presentable, SliderPluginParams } from '../types';

export default class Controller {
  private readonly views: (View & Listenable)[];

  private readonly model: SliderModel;

  constructor(
    private element: HTMLElement,
    private parameters?: SliderPluginParams,
  ) {
    this.views = [new PluginView(element, parameters)];
    this.model = new SliderModel(parameters);

    this.addListeners();
    this.passSliderData();
    this.passHandlersData(this.views[0], parameters?.handlers);
  }

  public addViews(newViews: (View & Listenable)[]): void {
    newViews.forEach((view) => {
      this.addView(view);
    });
  }

  public addView(newView: View & Listenable): void {
    this.views.push(newView);

    addListenerAfter('handleHandlerPositionChanged', this.passHandlerPositionChange, newView);
    newView.updateVisuals(this.parameters);

    this.passSliderData();
    this.passHandlersData(newView, this.parameters?.handlers);
  }

  public removeHandler(handlerIndex: number): void {
    this.model.removeHandler(handlerIndex);
  }

  public setMin(newMin: number): void {
    this.model.setMin(newMin);
    this.passSliderData();
  }

  public setMax(newMax: number): void {
    this.model.setMax(newMax);
    this.passSliderData();
  }

  public setStep(newStep: number): void {
    this.model.setStep(newStep);
    this.passSliderData();
  }

  public setTooltipVisibility(isVisible: boolean): void {
    this.views.forEach((view) => {
      view.updateVisuals({ tooltipsVisible: isVisible });
    });
  }

  public setVertical(isVertical: boolean): void {
    this.views.forEach((view) => {
      view.updateVisuals({ isVertical });
    });
  }

  public setMarkupVisibility(isVisible: boolean): void {
    this.views.forEach((view) => {
      view.updateVisuals({ withMarkup: isVisible });
    });
  }

  public addHandler(itemIndex: number, rangePair?: number | string): void {
    const handlerData = this.model.addHandler(itemIndex);
    if (!handlerData) { return; }

    this.addHandlerView({ ...handlerData, rangePair });
  }

  private addListeners(): void {
    addListenerAfter(
      'handlerValueChanged',
      this.passHandlerValueChange,
      this.model,
    );
    addListenerAfter(
      'removeHandler',
      this.removeHandlerInViews,
      this.model,
    );
    addListenerAfter(
      'handleHandlerPositionChanged',
      this.passHandlerPositionChange,
      this.views[0],
    );
  }

  private removeHandlerInViews = (handlerIndex: number): void => {
    this.views.forEach((view) => {
      view.removeHandler(handlerIndex);
    });
  }

  private passSliderData(): void {
    this.views.forEach((view) => {
      view.updateData(this.model.getSliderData());
    });
  }

  private passHandlerPositionChange = (data: { index: number; position: number }): void => {
    this.model.handleHandlerPositionChanged(data);
  }

  private passHandlerValueChange = (
    data: { index: number; relativeValue: number; item: Presentable },
  ): void => {
    this.views.forEach((view) => {
      view.handlersValuesChangedListener(data);
    });
  }

  private passHandlersData(targetView: View, initHandlersData?: object[]): void {
    const handlersData = this.model.getHandlersData();

    if (initHandlersData?.length > 0) {
      handlersData.handlersArray.forEach((handlerData, index) => {
        handlersData.handlersArray[index] = { ...initHandlersData[index], ...handlerData };
      });
    }

    targetView.initHandlers(handlersData);
  }

  private addHandlerView(
    handlerParams:
      {
        positionPart: number;
        item: Presentable;
        handlerIndex: number;
        rangePair: number | string;
        itemIndex: number;
      },
  ): void {
    this.views.forEach((view) => {
      view.addHandler(handlerParams);
    });
  }
}
