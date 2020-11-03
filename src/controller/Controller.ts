import PluginView from '../view/PluginView';
import SliderModel from '../model/SliderModel';
import { addListenerAfter } from '../utils/functions';
import { View } from '../view/interfaces';
import { Listenable } from '../utils/interfaces';
import { SliderViewData, SliderViewParams } from '../view/types';
import {
  HandlerModelData,
  HandlersModelData,
  SliderModelData,
  SliderModelParams,
} from '../model/types';
import { SliderPluginParams } from '../plugin/types';
import { Presentable } from '../utils/types';

class Controller {
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
    addListenerAfter('handleHandlerValueChanged', listener, this.model);
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

  public setHandlerItem(handlerIndex: number, item: Presentable): void {
    this.model.setHandlerItem(handlerIndex, item);
  }

  public update(params: SliderModelParams & SliderViewParams): void {
    this.model.setSliderParams(params);
    const modelData = this.model.getPositioningData();

    this.view.updateVisuals({ ...params, ...modelData });
  }

  public getSliderData(): SliderModelData & SliderViewData {
    return { ...this.view.getViewData(), ...this.model.getSliderData() };
  }

  public getHandlersData(initHandlersData?: object[]): HandlersModelData {
    const handlersData = this.model.getHandlersData();

    if (initHandlersData?.length > 0) {
      handlersData.handlersArray.forEach((handlerData, index) => {
        handlersData.handlersArray[index] = { ...initHandlersData[index], ...handlerData };
      });
    }

    return handlersData;
  }

  public addHandler(itemIndex: number, rangePair?: number | string): HandlerModelData {
    const handlerData = this.model.addHandler(itemIndex);
    if (!handlerData) { return null; }

    this.addHandlerView({ ...handlerData, rangePair });

    return handlerData;
  }

  private addDefaultListeners(): void {
    addListenerAfter('handleHandlerValueChanged', this.passHandlerValueChange, this.model);
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

  private passHandlerValueChange = (data: HandlerModelData): void => {
    this.view.handlerValueChangedListener(data);
  }

  private passHandlersData(targetView: View, initHandlersData?: object[]): void {
    const handlersData = this.getHandlersData(initHandlersData);

    targetView.initHandlers(handlersData);
  }

  private addHandlerView(handlerParams: HandlerModelData & { rangePair: number | string }): void {
    this.view.addHandler(handlerParams);
  }
}

export default Controller;