import Handler from "../__handler/handler";
import {defaultSliderClass} from "../../common";
import handler from "../__handler/handler";

export default class Range {
    public bodyHTML: string;
    public startHandler: Handler;
    public endHandler: Handler;
    private _element: Element;

    constructor(firstHandler: Handler, secondHandler?: Handler) {
        if (secondHandler)
            this.arrangeHandlers(firstHandler, secondHandler);

        if (firstHandler.isStart)
            this.startHandler = firstHandler;
        else
            this.endHandler = firstHandler;

        this.bodyHTML = `<div class=${defaultSliderClass}__range></div>`;
    }

    private arrangeHandlers(firstHandler: Handler, secondHandler: Handler) {
        if (firstHandler.position <= secondHandler.position) {
            this.startHandler = firstHandler;
            this.endHandler = secondHandler;
        } else {
            this.startHandler = secondHandler;
            this.endHandler = firstHandler;
        }
    };

    public addHandler(handler: Handler) {

    }

    public removeHandler(handler: Handler) {

    }

    public isHandlerInRange(handler: Handler) {
        return handler === this.startHandler || handler === this.endHandler;
    }
}
