import PluginView from '../view/pluginView';
import SliderModel from '../model/sliderModel';
import { addListenerAfter } from '../utils/functions';
import {
  Presentable, Listenable, View, SliderPluginParams,
} from '../utils/interfacesAndTypes';

export default class Controller {
  private readonly views: (View & Listenable)[];

  private readonly model: SliderModel;

  constructor(
    private element: HTMLElement,
    private parameters?: SliderPluginParams,
  ) {
    const newView = new PluginView(element, parameters);
    this.views = [newView];
    this.model = new SliderModel(parameters);

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

    this.passSliderData();
    this.passHandlersData(newView, parameters?.handlers);
  }

  public addViews(newViews: (View & Listenable)[]): void {
    newViews.forEach((view) => {
      this.addView(view);
    });
  }

  public addView(newView: View & Listenable): void {
    this.views.push(newView);

    addListenerAfter('handleHandlerPositionChanged', this.passHandlerPositionChange, newView);
    newView.passVisualProps(this.parameters);

    this.passSliderData();
    this.passHandlersData(newView, this.parameters?.handlers);
  }

  public removeHandler(handlerIndex: number): void {
    const removeResult = this.model.removeHandler(handlerIndex);
    if (!removeResult) { return; }

    this.removeHandlerInViews(handlerIndex);
  }

  public setMin(newMin: number): void {
    if (newMin === null || newMin === undefined) {
      return;
    }

    this.model.setMin(newMin);
    this.passSliderData();
  }

  public setMax(newMax: number): void {
    if (newMax === null || newMax === undefined) {
      return;
    }

    this.model.setMax(newMax);
    this.passSliderData();
  }

  public setStep(newStep: number): void {
    if (newStep === null || newStep === undefined) {
      return;
    }

    this.model.setStep(newStep);
    this.passSliderData();
  }

  public setTooltipVisibility(newState: boolean): void {
    if (newState === null || newState === undefined) {
      return;
    }

    this.views.forEach((view) => {
      view.passVisualProps({ tooltipsVisible: newState });
    });
  }

  public setVertical(isVertical: boolean): void {
    if (isVertical === null || isVertical === undefined) {
      return;
    }

    this.views.forEach((view) => {
      view.passVisualProps({ isVertical });
    });
  }

  public setMarkupVisibility(isVisible: boolean): void {
    if (isVisible === null || isVisible === undefined) {
      return;
    }

    this.views.forEach((view) => {
      view.passVisualProps({ withMarkup: isVisible });
    });
  }

  public addHandler(itemIndex: number, rangePair?: number | string): void {
    const handlerData = this.model.addHandler(itemIndex);
    if (!handlerData) {
      return;
    }

    this.addHandlerView({ ...handlerData, rangePair });
  }

  private removeHandlerInViews = (handlerIndex: number): void => {
    this.views.forEach((view) => {
      view.removeHandler(handlerIndex);
    });
  }

  private passSliderData(): void {
    this.views.forEach((view) => {
      view.passDataProps(this.model.getSliderData());
    });
  }

  /**
   * Вызов обработки в модели, когда меняется позиция хэндлера в Виде
   * @param data
   */
  private passHandlerPositionChange = (data: { index: number; position: number }): void => {
    this.model.handleHandlerPositionChanged(data);
  }

  /**
   * Вызов обработчика в Виде, когда меняется значение хэндлера в Модели
   * @param data
   * @param data.index Индекс хэндлера
   * @param data.relativeValue Относительное значение (от 0 до 1),
   * которое Вид будет преобразовывать в смещение
   * @param data.item Данные на этой позиции
   * @private
   */
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
