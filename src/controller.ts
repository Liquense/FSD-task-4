import View from "./view"
import Model from "./model"
import {addListenerAfter} from "./common";

export default class Controller {
    private _view: View;
    private readonly _model: Model;

    constructor(
        DOMElement: HTMLElement,
        parameters?: { handlers?: object[] },
    ) {
        this._view = new View(DOMElement, parameters);
        this._model = new Model(parameters);

        addListenerAfter("handlerValueChanged", this.passHandlerValueChange.bind(this), this._model);
        addListenerAfter("handlerPositionChanged", this.passHandlerPositionChange.bind(this), this._view);
        addListenerAfter("createHandler", this.viewAddHandler.bind(this), this._model);

        this.passSliderData(this._view);
        this.passHandlersData(parameters?.handlers);
    }


    private passSliderData(receiver: Model | View,) {
        if (receiver instanceof Model) {

        }
        if (receiver instanceof View) {
            this._view.setSliderData(this._model.getSliderData());
        }
    }

    private passHandlerPositionChange(data: { index: number, position: number }) {
        this._model.handleHandlerPositionChanged(data);
    }

    private passHandlerValueChange(data: { index: number, position: number, value: any }): void {
        this._view.handlersValuesChangedListener(data);
    }

    private passHandlersData(initHandlersData: object[]) {
        let handlersData = this._model.getHandlersData();

        if (initHandlersData)
            handlersData.handlersArray.forEach((handlerData, index) => {
                handlersData.handlersArray[index] = {...initHandlersData[index], ...handlerData};
            });

        this._view.initHandlers(handlersData);
    }

    private viewAddHandler() {
        console.log("binding!");
        this._view.addHandler();
    }
}
