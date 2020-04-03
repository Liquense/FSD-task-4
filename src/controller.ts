import View from "./view"
import Model from "./model"
import {addListenerAfter} from "./common";

export default class Controller {
    private _views: SliderView[];
    private readonly _model: Model;

    constructor(
        Element: HTMLElement,
        parameters?: { handlers?: object[] },
    ) {
        const newView = new View(Element, parameters);

        this._views = [newView];
        this._model = new Model(parameters);

        addListenerAfter("handlerValueChanged", this._boundPassHandlerValueChange, this._model);
        addListenerAfter("createHandler", this._boundViewAddHandler, this._model);
        addListenerAfter("handlerPositionChangedCallback", this._boundPassHandlerPositionChange, newView);

        this.passSliderData();
        this._passHandlersData(parameters?.handlers);
    }

    public addViews(newViews: SliderView[]) {
        newViews.forEach(view => {
            this.addView(view)
        });
    }

    public addView(newView: SliderView) {
        this._views.push(newView);
    }


    private passSliderData() {
        this._views.forEach(view => {
            view.setSliderData(this._model.getSliderData());
        });
    }

    private _boundPassHandlerPositionChange = this.passHandlerPositionChange.bind(this);

    public passHandlerPositionChange(data: { index: number, position: number }) {
        this._model.handleHandlerPositionChanged(data);
    }

    private _boundPassHandlerValueChange = this._passHandlerValueChange.bind(this);

    private _passHandlerValueChange(data: { index: number, position: number, value: any }): void {
        this._views.forEach(view => {
            view.handlersValuesChangedListener(data);
        });
    }

    private _passHandlersData(initHandlersData?: object[]) {
        let handlersData = this._model.getHandlersData();

        if (initHandlersData) {
            handlersData.handlersArray.forEach((handlerData, index) => {
                handlersData.handlersArray[index] = {...initHandlersData[index], ...handlerData};
            });
        }


        this._views.forEach(view => {
            view.initHandlers(handlersData);
        });
    }

    private _boundViewAddHandler = this._addHandlerView.bind(this);

    private _addHandlerView() {
        console.log("binding!");
        this._views.forEach(view => {
            view.addHandler();
        });
    }
}

export interface SliderView {
    setSliderData: Function;
    handlersValuesChangedListener: Function;
    initHandlers: Function;
    addHandler: Function;
}
