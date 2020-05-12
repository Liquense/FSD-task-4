import DefaultView from '../view/defaultView';
import SliderModel from '../model/sliderModel';
import { addListenerAfter } from '../utils/common';
import { Presentable } from '../utils/types';
import { Listenable, View } from '../utils/interfaces';

export default class Controller {
    private _views: (View & Listenable)[];

    private readonly _model: SliderModel;

    constructor(
        private _element: HTMLElement,
        private parameters?: {
            additionalClasses?: string;
            items?: Array<Presentable>;
            values?: number[]; // актуально, если не заданы handlers
            isRange?: boolean; // актуально, если не заданы handlers
            isVertical?: boolean;
            isReversed?: boolean;
            min?: number;
            max?: number;
            step?: number;
            showTooltips?: boolean;
            withMarkup?: boolean;
            handlers?: {
                itemIndex: number;
                additionalClasses?: string;
                rangePair?: string | number;
                withTooltip?: boolean;
                tooltip?: {
                    additionalClasses?: string;
                };
            }[];
        },
    ) {
      const newView = new DefaultView(_element, parameters);
      this._views = [newView];
      this._model = new SliderModel(parameters);

      addListenerAfter(
        'handlerValueChanged',
        this._boundPassHandlerValueChange, this._model,
      );
      addListenerAfter(
        'handlerPositionChanged',
        this._boundPassHandlerPositionChange, this._views[0],
      );

      this._passSliderData();
      this._passHandlersData(newView, parameters?.handlers);
    }

    public addViews(newViews: (View & Listenable)[]): void {
      newViews.forEach((view) => {
        this.addView(view);
      });
    }

    public addView(newView: View & Listenable): void {
      this._views.push(newView);

      addListenerAfter('handlerPositionChanged', this._boundPassHandlerPositionChange, newView);
      newView.passVisualProps(this.parameters);

      this._passSliderData();
      this._passHandlersData(newView, this.parameters?.handlers);
    }

    private _passSliderData(): void {
      this._views.forEach((view) => {
        view.passDataProps(this._model.getSliderData());
      });
    }

    private _boundPassHandlerPositionChange = this._passHandlerPositionChange.bind(this);

    /**
     * Вызов обработки в модели, когда меняется позиция хэндлера в Виде
     * @param data
     */
    private _passHandlerPositionChange(data: { index: number; position: number }): void {
      this._model.handleHandlerPositionChanged(data);
    }

    private _boundPassHandlerValueChange = this._passHandlerValueChange.bind(this);

    /**
     * Вызов обработчика в Виде, когда меняется значение хэндлера в Модели
     * @param data
     * @param data.index Индекс хэндлера
     * @param data.relativeValue Относительное значение (от 0 до 1),
     * которое Вид будет преобразовывать в смещение
     * @param data.item Данные на этой позиции
     * @private
     */
    private _passHandlerValueChange(
      data: { index: number; relativeValue: number; item: Presentable },
    ): void {
      this._views.forEach((view) => {
        view.handlersValuesChangedListener(data);
      });
    }

    private _passHandlersData(targetView: View, initHandlersData?: object[]): void {
      const handlersData = this._model.getHandlersData();

      if (initHandlersData?.length > 0) {
        handlersData.handlersArray.forEach((handlerData, index) => {
          handlersData.handlersArray[index] = { ...initHandlersData[index], ...handlerData };
        });
      }

      targetView.initHandlers(handlersData);
    }

    public addHandler(itemIndex: number, rangePair?: number | string): void {
      const handlerData = this._model.addHandler(itemIndex);
      if (!handlerData) {
        return;
      }

      this._addHandlerView({ ...handlerData, rangePair });
    }

    private _addHandlerView(
      handlerParams:
            {
                positionPart: number;
                item: Presentable;
                handlerIndex: number;
                rangePair: number | string;
                itemIndex: number;
            },
    ): void {
      this._views.forEach((view) => {
        view.addHandler(handlerParams);
      });
    }

    public removeHandler(handlerIndex: number): void {
      const removeResult = this._model.removeHandler(handlerIndex);
      if (!removeResult) {
        return;
      }

      this._views.forEach((view) => {
        view.removeHandler(handlerIndex);
      });
    }

    public setMin(newMin: number): void {
      if (newMin === null || newMin === undefined) {
        return;
      }

      this._model.setMinMax({ min: newMin });
      this._passSliderData();
    }

    public setMax(newMax: number): void {
      if (newMax === null || newMax === undefined) {
        return;
      }

      this._model.setMinMax({ max: newMax });
      this._passSliderData();
    }

    public setStep(newStep: number): void {
      if (newStep === null || newStep === undefined) {
        return;
      }

      this._model.setStep({ step: newStep });
      this._passSliderData();
    }

    public setTooltipVisibility(newState: boolean): void {
      if (newState === null || newState === undefined) {
        return;
      }

      this._views.forEach((view) => {
        view.passVisualProps({ tooltipsVisible: newState });
      });
    }

    public setVertical(isVertical: boolean): void {
      if (isVertical === null || isVertical === undefined) {
        return;
      }

      this._views.forEach((view) => {
        view.passVisualProps({ isVertical });
      });
    }

    public setMarkupVisibility(isVisible: boolean): void {
      if (isVisible === null || isVisible === undefined) {
        return;
      }

      this._views.forEach((view) => {
        view.passVisualProps({ withMarkup: isVisible });
      });
    }
}
