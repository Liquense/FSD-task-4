import PluginView from '../view/pluginView';
import SliderModel from '../model/sliderModel';
import { addListenerAfter } from '../utils/functions';
import { View } from '../view/interfaces';
import { Listenable } from '../interfaces';
import { SliderPluginParams } from '../types';
import { SliderViewParams } from '../view/types';
import { HandlerModelParams } from '../model/types';

export default class Controller {
  private readonly views: (View & Listenable)[];

  private readonly model: SliderModel;

  constructor(
    private element: HTMLElement,
    private parameters?: SliderPluginParams,
  ) {
    this.views = [new PluginView(element, parameters)];
    this.model = new SliderModel(parameters);

    this.addDefaultListeners();
    this.passSliderData();
    this.passHandlersData(this.views[0], parameters?.handlers);
  }

  public addHandlerValueChangedListener(listener: Function): void {
    addListenerAfter('handlerValueChanged', listener, this.model);
  }

  public addRemoveHandlerListener(listener: Function): void {
    addListenerAfter('removeHandler', listener, this.model);
  }

  public removeHandler(handlerIndex: number): void {
    this.model.removeHandler(handlerIndex);
  }

  public moveHandler(handlerIndex: number, positionPart: number): void {
    this.passHandlerPositionChange({ index: handlerIndex, position: positionPart });
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
      view.updateVisuals({ isTooltipsVisible: isVisible });
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

  public getViewParameters(): SliderViewParams {
    return this.views[0].getViewData();
  }

  public getSliderParameters(): { min: number; max: number; step: number} {
    return { min: this.model.getMin(), max: this.model.getMax(), step: this.model.getStep() };
  }

  public getMax(): number {
    return this.model.getMax();
  }

  public getMin(): number {
    return this.model.getMin();
  }

  public getHandlersData(initHandlersData?: object[]): {
    customHandlers: boolean;
    handlersArray: HandlerModelParams[];
  } {
    const handlersData = this.model.getHandlersData();

    if (initHandlersData?.length > 0) {
      handlersData.handlersArray.forEach((handlerData, index) => {
        handlersData.handlersArray[index] = { ...initHandlersData[index], ...handlerData };
      });
    }

    return handlersData;
  }

  public addHandler(itemIndex: number, rangePair?: number | string): HandlerModelParams {
    const handlerData = this.model.addHandler(itemIndex);
    if (!handlerData) { return null; }

    this.addHandlerView({ ...handlerData, rangePair });

    return handlerData;
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
      view.updateData(this.model.getPositioningData());
    });
  }

  private passHandlerPositionChange = (data: { index: number; position: number }): void => {
    this.model.handleHandlerPositionChanged(data);
  }

  private passHandlerValueChange = (data: HandlerModelParams): void => {
    this.views.forEach((view) => {
      view.handlerValueChangedListener(data);
    });
  }

  private passHandlersData(targetView: View, initHandlersData?: object[]): void {
    const handlersData = this.getHandlersData(initHandlersData);

    targetView.initHandlers(handlersData);
  }

  private addHandlerView(
    handlerParams: HandlerModelParams & { rangePair: number | string },
  ): void {
    this.views.forEach((view) => {
      view.addHandler(handlerParams);
    });
  }
}
