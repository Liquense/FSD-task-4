import View from "./view"
import Model from "./model"
import {addListenerAfter, Listenable} from "./common";

export default class Controller {
    private _views: (SliderView & Listenable)[];
    private readonly _model: Model;

    constructor(
        private _element: HTMLElement,
        private _parameters?: {
            additionalClasses?: string,
            items?: Array<any>,
            values?: number[], //если не заданы handlers
            isRange?: boolean, //если не заданы handlers
            isVertical?: boolean,
            isReversed?: boolean,
            min?: number,
            max?: number,
            step?: number,
            showTooltips?: boolean,
            withMarkup?: boolean,
            handlers?: {
                value?: number,
                additionalClasses?: string,
                rangePair?: string | number,
                withTooltip?: boolean,
                tooltip?: {
                    additionalClasses?: string,
                    bodyHTML?: string,
                },
            }[],
        },
    ) {
        const newView = new View(_element, _parameters);
        this._views = [newView];
        this._model = new Model(_parameters);

        addListenerAfter("handlerValueChanged", this._boundPassHandlerValueChange, this._model);
        addListenerAfter("handlerPositionChanged", this._boundPassHandlerPositionChange, newView);

        this.passSliderData();
        this._passHandlersData(newView, _parameters?.handlers);
    }

    public addViews(newViews: (SliderView & Listenable)[]) {
        newViews.forEach((view) => {
            this.addView(view)
        });
    }

    public addView(newView: SliderView & Listenable) {
        this._views.push(newView);

        addListenerAfter("handlerPositionChanged", this._boundPassHandlerPositionChange, newView);
        newView.passVisualProps(this._parameters);

        this.passSliderData();
        this._passHandlersData(newView, this._parameters?.handlers);
    }

    private passSliderData() {
        this._views.forEach(view => {
            view.passDataProps(this._model.getSliderData());
        });
    }

    private _boundPassHandlerPositionChange = this._passHandlerPositionChange.bind(this);

    /**
     * Вызов обработки в модели, когда меняется позиция хэндлера в Виде
     * @param data
     */
    private _passHandlerPositionChange(data: { index: number, position: number }) {
        this._model.handleHandlerPositionChanged(data);
    }

    private _boundPassHandlerValueChange = this._passHandlerValueChange.bind(this);

    /**
     * Вызов обработчика в Виде, когда меняется значение хэндлера в Модели
     * @param data
     * @param data.index Индекс хэндлера
     * @param data.relativeValue Относительное значение (от 0 до 1), которое Вид преобразует в смещение
     * @param data.item Данные на этой позиции
     * @private
     */
    private _passHandlerValueChange(data: { index: number, relativeValue: number, item: any }): void {
        this._views.forEach(view => {
            view.handlersValuesChangedListener(data);
        });
    }

    private _passHandlersData(targetView: SliderView, initHandlersData?: object[]) {
        let handlersData = this._model.getHandlersData();

        if (initHandlersData?.length > 0) {
            handlersData.handlersArray.forEach((handlerData, index) => {
                handlersData.handlersArray[index] = {...initHandlersData[index], ...handlerData};
            });
        }

        targetView.initHandlers(handlersData);
    }

    public addHandler(itemIndex: number, rangePair?: number | string) {
        const handlerData = this._model.addHandler(itemIndex);
        if (!handlerData)
            return;

        this._addHandlerView({...handlerData, rangePair: rangePair});
    }

    private _addHandlerView(handlerParams: { positionPart: number, value: any, handlerIndex: number, rangePair: number | string }) {
        this._views.forEach(view => {
            view.addHandler(handlerParams);
        });
    }

    public removeHandler(handlerIndex: number) {
        const removeResult = this._model.removeHandler(handlerIndex);
        if (!removeResult)
            return;

        this._views.forEach(view => {
            view.removeHandler(handlerIndex);
        })
    }

    public setMin(newMin: number) {
        if (newMin === null || newMin === undefined)
            return;

        this._model.setMinMax({min: newMin})
        this.passSliderData();
    }

    public setMax(newMax: number) {
        if (newMax === null || newMax === undefined)
            return;

        this._model.setMinMax({max: newMax})
        this.passSliderData();
    }

    public setStep(newStep: number) {
        if (newStep === null || newStep === undefined)
            return;

        this._model.setStep({step: newStep});
        this.passSliderData();
    }

    public setTooltipVisibility(newState: boolean) {
        if (newState === null || newState === undefined)
            return;

        this._views.forEach(view => {
            view.passVisualProps({tooltipsVisible: newState});
        });
    }

    public setVertical(isVertical: boolean): void {
        if (isVertical === null || isVertical === undefined)
            return;

        this._views.forEach(view => {
            view.passVisualProps({isVertical: isVertical});
        })
    }

    public setMarkupVisibility(isVisible: boolean): void {
        if (isVisible === null || isVisible === undefined)
            return;

        this._views.forEach(view => {
            view.passVisualProps({withMarkup: isVisible});
        })
    }
}

export interface SliderView {
    passVisualProps(parameters?: { isVertical?: boolean, tooltipsVisible?: boolean, withMarkup?: boolean }): void;

    passDataProps(sliderData: { step?: number, absoluteStep: number, min: number, max: number }): void;

    /**
     * Функция, которую слушает контроллер
     */
    handlerPositionChanged: Function;

    handlersValuesChangedListener(data: { index: number, relativeValue: number, item: any }): void;

    initHandlers(handlersData: {
        customHandlers: boolean,
        handlersArray: {
            index: number,
            positionPart: number,
            value: any,
            valueIndex: number
        }[]
    }): void;

    addHandler(handlerParams: { positionPart: number, value: any, handlerIndex: number }): void;

    removeHandler(handlerIndex: number): void;
}
