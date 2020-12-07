import bind from 'bind-decorator';
import SliderModel from '../model/SliderModel';
import {
  HandlerModelData,
  HandlersModelData, SliderData,
  SliderParams,
} from '../model/types';
import { SliderPluginParams } from '../plugin/types';
import { Presentable } from '../utils/types';
import { Observable } from '../utils/Observer/interfaces';
import SliderView from '../view/SliderView';
import { HandlerPair, HandlerPositionData } from '../view/types';
import { View } from '../view/interfaces';

class Controller {
  public readonly originalHTML: string;

  private readonly view: View & Observable;

  private readonly model: SliderModel;

  constructor(
    private element: HTMLElement,
    private parameters?: SliderPluginParams,
  ) {
    this.model = new SliderModel(parameters);
    this.view = new SliderView(
      element, { ...this.model.getPositioningData(), ...this.model.getSliderData() },
    );
    this.originalHTML = element.innerHTML;

    this.addDefaultListeners();
    this.passPositioningData();
    this.passHandlersData(this.view, parameters?.handlers);
  }

  public addHandlerValueChangedListener(listener: Function): void {
    this.model.addHandlerValueChangedListener(listener);
  }

  public addRemoveHandlerListener(listener: Function): void {
    this.model.addRemoveHandlerListener(listener);
  }

  public removeHandler(handlerIndex: number): void {
    this.model.removeHandler(handlerIndex);
  }

  public moveHandler(handlerIndex: number, position: number): void {
    this.passHandlerPositionChange({ handlerIndex, position });
  }

  public setHandlerItem(handlerIndex: number, item: Presentable): void {
    this.model.setHandlerItem(handlerIndex, item);
  }

  public update(params: SliderParams): void {
    this.model.setSliderParams(params);

    this.view.update({ ...this.model.getSliderData(), ...this.model.getPositioningData() });
  }

  public getSliderData(): SliderData {
    return this.model.getSliderData();
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

  public addHandler(itemIndex: number, pair?: HandlerPair): HandlerModelData {
    const handlerData = this.model.addHandler(itemIndex);
    if (!handlerData) {
      return null;
    }

    this.view.addHandler({ ...handlerData, ...{ rangePair: pair } });

    return handlerData;
  }

  private addDefaultListeners(): void {
    this.addHandlerValueChangedListener(this.passHandlerValueChange);
    this.addRemoveHandlerListener(this.removeHandlerInView);
    this.view.addHandlerPositionChangedListener(this.passHandlerPositionChange);
  }

  @bind
  private removeHandlerInView(handlerIndex: number): void {
    this.view.removeHandler(handlerIndex);
  }

  private passPositioningData(): void {
    this.view.update(this.model.getPositioningData());
  }

  @bind
  private passHandlerPositionChange(data: HandlerPositionData): void {
    this.model.handleHandlerPositionChanged(data);
  }

  @bind
  private passHandlerValueChange(data: HandlerModelData): void {
    this.view.setHandlersData([data]);
  }

  private passHandlersData(targetView: View, initHandlersData?: object[]): void {
    const handlersData = this.getHandlersData(initHandlersData);

    targetView.initHandlers(handlersData);
  }
}

export default Controller;
