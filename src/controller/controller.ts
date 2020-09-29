import DefaultView from '../view/defaultView';
import SliderModel from '../model/sliderModel';
import { addListenerAfter } from '../utils/common';
import { Presentable, Listenable, View } from '../utils/interfacesAndTypes';

export default class Controller {
    private readonly views: (View & Listenable)[];

    private readonly model: SliderModel;

    constructor(
        private element: HTMLElement,
        private parameters?: {
            additionalClasses?: string;
            items?: Array<Presentable>;
            values?: number[];
            isRange?: boolean;
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
      const newView = new DefaultView(element, parameters);
      this.views = [newView];
      this.model = new SliderModel(parameters);

      addListenerAfter(
        'handlerValueChanged',
        this.boundPassHandlerValueChange, this.model,
      );
      addListenerAfter(
        'handleHandlerPositionChanged',
        this.boundPassHandlerPositionChange, this.views[0],
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

      addListenerAfter('handleHandlerPositionChanged', this.boundPassHandlerPositionChange, newView);
      newView.passVisualProps(this.parameters);

      this.passSliderData();
      this.passHandlersData(newView, this.parameters?.handlers);
    }

    private passSliderData(): void {
      this.views.forEach((view) => {
        view.passDataProps(this.model.getSliderData());
      });
    }

    private boundPassHandlerPositionChange = this.passHandlerPositionChange.bind(this);

    /**
     * Вызов обработки в модели, когда меняется позиция хэндлера в Виде
     * @param data
     */
    private passHandlerPositionChange(data: { index: number; position: number }): void {
      this.model.handleHandlerPositionChanged(data);
    }

    private boundPassHandlerValueChange = this.passHandlerValueChange.bind(this);

    /**
     * Вызов обработчика в Виде, когда меняется значение хэндлера в Модели
     * @param data
     * @param data.index Индекс хэндлера
     * @param data.relativeValue Относительное значение (от 0 до 1),
     * которое Вид будет преобразовывать в смещение
     * @param data.item Данные на этой позиции
     * @private
     */
    private passHandlerValueChange(
      data: { index: number; relativeValue: number; item: Presentable },
    ): void {
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

    public addHandler(itemIndex: number, rangePair?: number | string): void {
      const handlerData = this.model.addHandler(itemIndex);
      if (!handlerData) {
        return;
      }

      this.addHandlerView({ ...handlerData, rangePair });
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

    public removeHandler(handlerIndex: number): void {
      const removeResult = this.model.removeHandler(handlerIndex);
      if (!removeResult) {
        return;
      }

      this.views.forEach((view) => {
        view.removeHandler(handlerIndex);
      });
    }

    public setMin(newMin: number): void {
      if (newMin === null || newMin === undefined) {
        return;
      }

      this.model.setMinMax({ min: newMin });
      this.passSliderData();
    }

    public setMax(newMax: number): void {
      if (newMax === null || newMax === undefined) {
        return;
      }

      this.model.setMinMax({ max: newMax });
      this.passSliderData();
    }

    public setStep(newStep: number): void {
      if (newStep === null || newStep === undefined) {
        return;
      }

      this.model.setStep({ step: newStep });
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
}
