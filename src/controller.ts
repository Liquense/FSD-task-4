import View from "./view"
import Model from "./model"
import {addListenerAfter} from "./common";

export default class Controller {
    private _view: View;
    private _model: Model;

    constructor(
        DOMElement: Element,
        parameters: object,
    ) {
        this._view = new View(DOMElement, parameters);
        this._model = new Model(parameters);

        addListenerAfter("handlerValueChanged", this._view.handlersValuesChangedListener, this._model);
        addListenerAfter("createHandler", this.viewAddHandler, this._model);

        const initialHandlersData = this._model.getHandlersData();
        this.passHandlersData(this._view, initialHandlersData);
        const initialSliderData = this._model.getSliderData();
        this.passSliderData(this._view, initialSliderData);

    }


    private passSliderData(
        receiver: Model | View,
        sliderData: {step: number},
    ) {
        if (receiver instanceof Model) {

        } else {
            this._view.setSliderData(sliderData);
        }
    }

    private passHandlersData(
        receiver: Model | View,
        handlersData: { value: any, position: number, }[]
    ) {
        if (receiver instanceof Model) {

        } else {
            this._view.setHandlersData(handlersData);
        }
    }

    private viewAddHandler() {
        console.log("binding!");
        this._view.addHandler();
    }
}
