import SliderModel from '../model/SliderModel';
import {
  HandlerModelData,
  HandlersModelData, SliderData,
  SliderParams,
} from '../model/types';
import { SliderPluginParams } from '../plugin/types';
import { Presentable } from '../utils/types';
import { Observable, Observer } from '../utils/Observer/Observer';
import SliderView from '../view/SliderView';
import { HandlerPair, HandlerPositionData } from '../view/types';

class Controller {
  public readonly originalHTML: string;

  private readonly view: SliderView & Observable;

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

  public addAfterHandlerValueChangedListener(listener: Function): void {
    Observer.addListener('handleHandlerValueChanged', this.model, listener);
  }

  public addAfterRemoveHandlerListener(listener: Function): void {
    Observer.addListener('removeHandler', this.model, listener);
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
    if (!handlerData) { return null; }

    this.addHandlerView({ ...handlerData, rangePair: pair });

    return handlerData;
  }

  private addDefaultListeners(): void {
    Observer.addListener('handleHandlerValueChanged', this.model, this.passHandlerValueChange);
    Observer.addListener('removeHandler', this.model, this.removeHandlerInView);
    Observer.addListener('handleMouseMove', this.view, this.passHandlerPositionChange);
  }

  private removeHandlerInView = (handlerIndex: number): void => {
    this.view.removeHandler(handlerIndex);
  }

  private passPositioningData(): void {
    this.view.update(this.model.getPositioningData());
  }

  private passHandlerPositionChange = (
    data: HandlerPositionData,
  ): void => {
    this.model.handleHandlerPositionChanged(data);
  }

  private passHandlerValueChange = (data: HandlerModelData): void => {
    this.view.setHandlersData([data]);
  }

  private passHandlersData(targetView: SliderView, initHandlersData?: object[]): void {
    const handlersData = this.getHandlersData(initHandlersData);

    targetView.initHandlers(handlersData);
  }

  private addHandlerView(handlerParams: HandlerModelData & { rangePair: HandlerPair }): void {
    this.view.addHandler(handlerParams);
  }
}

export default Controller;
