import PluginView from '../view/PluginView';
import SliderModel from '../model/SliderModel';
import { addListenerAfter } from '../utils/functions';
import { View } from '../view/interfaces';
import { Listenable } from '../interfaces';
import { SliderPluginParams } from '../types';
import { SliderViewParams } from '../view/types';
import { HandlerModelParams } from '../model/types';

export default class Controller {
  private readonly view: View & Listenable;

  private readonly model: SliderModel;

  constructor(
    private element: HTMLElement,
    private parameters?: SliderPluginParams,
  ) {
    this.view = new PluginView(element, parameters);
    this.model = new SliderModel(parameters);

    this.addDefaultListeners();
    this.passSliderData();
    this.passHandlersData(this.view, parameters?.handlers);
  }

  public addAfterHandlerValueChangedListener(listener: Function): void {
    addListenerAfter('handlerValueChanged', listener, this.model);
  }

  public addAfterRemoveHandlerListener(listener: Function): void {
    addListenerAfter('removeHandler', listener, this.model);
  }

  public removeHandler(handlerIndex: number): void {
    this.model.removeHandler(handlerIndex);
  }

  public moveHandler(handlerIndex: number, positionPart: number): void {
    this.passHandlerPositionChange({ handlerIndex, positionPart });
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
    this.view.updateVisuals({ isTooltipsVisible: isVisible });
  }

  public setVertical(isVertical: boolean): void {
    this.view.updateVisuals({ isVertical });
  }

  public setMarkupVisibility(isVisible: boolean): void {
    this.view.updateVisuals({ withMarkup: isVisible });
  }

  public getVisualParameters(): SliderViewParams {
    return this.view.getViewData();
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

  private addDefaultListeners(): void {
    addListenerAfter('handlerValueChanged', this.passHandlerValueChange, this.model);
    addListenerAfter('removeHandler', this.removeHandlerInView, this.model);
    addListenerAfter('handleHandlerPositionChanged', this.passHandlerPositionChange, this.view);
  }

  private removeHandlerInView = (handlerIndex: number): void => {
    this.view.removeHandler(handlerIndex);
  }

  private passSliderData(): void {
    this.view.updateData(this.model.getPositioningData());
  }

  private passHandlerPositionChange = (
    data: { handlerIndex: number; positionPart: number },
  ): void => {
    this.model.handleHandlerPositionChanged(data);
  }

  private passHandlerValueChange = (data: HandlerModelParams): void => {
    this.view.handlerValueChangedListener(data);
  }

  private passHandlersData(targetView: View, initHandlersData?: object[]): void {
    const handlersData = this.getHandlersData(initHandlersData);

    targetView.initHandlers(handlersData);
  }

  private addHandlerView(handlerParams: HandlerModelParams & { rangePair: number | string }): void {
    this.view.addHandler(handlerParams);
  }
}
