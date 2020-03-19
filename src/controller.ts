import View from "./view"
import Model from "./model"
import {addListenerAfter} from "./common";

export default class Controller {
    private readonly _view: View;
    private readonly _model: Model;

    constructor(
        Element: HTMLElement,
        parameters?: { handlers?: object[] },
    ) {
        this._view = new View(Element, parameters);
        this._model = new Model(parameters);

        addListenerAfter("handlerValueChanged", this._boundPassHandlerValueChange, this._model);
        addListenerAfter("handlerPositionChangedCallback", this._boundPassHandlerPositionChange, this._view);
        addListenerAfter("createHandler", this._boundViewAddHandler, this._model);

        this.passSliderData();
        this._passHandlersData(parameters?.handlers);
    }


    private passSliderData() {
        this._view.setSliderData(this._model.getSliderData());
    }

    private _boundPassHandlerPositionChange = this._passHandlerPositionChange.bind(this);
    private _passHandlerPositionChange(data: { index: number, position: number }) {
        this._model.handleHandlerPositionChanged(data);
    }

    private _boundPassHandlerValueChange = this._passHandlerValueChange.bind(this);
    private _passHandlerValueChange(data: { index: number, position: number, value: any }): void {
        this._view.handlersValuesChangedListener(data);
    }

    private _passHandlersData(initHandlersData?: object[]) {
        let handlersData = this._model.getHandlersData();

        if (initHandlersData) {
            handlersData.handlersArray.forEach((handlerData, index) => {
                handlersData.handlersArray[index] = {...initHandlersData[index], ...handlerData};
            });
        }

        this._view.initHandlers(handlersData);
    }

    private _boundViewAddHandler = this._addHandlerView.bind(this);
    private _addHandlerView() {
        console.log("binding!");
        this._view.addHandler();
    }
}
