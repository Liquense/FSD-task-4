import View from "./view"
import Model from "./model"
import {addListener} from "./common";

export default class Controller {
    private _view: View;
    private _model: Model;

    constructor(
        DOMElement: Element,
        parameters: object,
    ) {
        this._view = new View(DOMElement, parameters);
        this._model = new Model(parameters);

        addListener("handlerValueChanged", this._view.handlersValuesChangedListener, this._model);

        const initialHandlersData = this._model.getHandlersData();
        this.passHandlersData(this._view, initialHandlersData);
    }

    private passHandlersData(whereToPass: Model | View,
                             whatToPass:
                                 { value: number, position: number, }[]
    ) {
        if (whereToPass instanceof Model) {

        } else {
            this._view.setHandlersData(whatToPass);
        }
    }
}
