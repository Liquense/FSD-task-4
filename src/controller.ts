import View from "./view"
import Model from "./model"
import handler from "./slider/__handler/handler";

export default class Controller {
    private _view: View;
    private _model: Model;

    constructor(
        DOMElement: Element,
        parameters: object,
    ) {
        this._view = new View(DOMElement, parameters);
        this._model = new Model(parameters);
    }
}
