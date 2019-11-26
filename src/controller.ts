import View from "./view"
import Model from "./model"
import {Handler} from "./slider/__handler/handler";
import {Tooltip} from "./slider/__handler/__tooltip/tooltip";

export default class Controller {
    private _element: HTMLElement;
    private _view: View;
    private _model: Model;

    constructor(
        DOMElement,
        parameters: {
            min: number;
            isVertical: boolean;
            max: number;
            handlers: Handler[];
            sliderClass: string;
            tooltip: Tooltip;
            items: Array<string>;
            isRange: boolean
        }) {
        if (!Array.isArray(DOMElement)) {
            throw new Error("There is no HTML elements founded");
        }
        if (DOMElement.length <= 0) {
            throw new Error(`Array ${DOMElement} hasn't any elements`);
        }
        this._element = DOMElement[0];
        this._model = new Model();
        this._view = new View();

        console.log(this._element);
    }

}
