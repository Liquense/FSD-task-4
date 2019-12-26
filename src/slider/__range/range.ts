import HandlerView from "../__handler/handler";
import {defaultSliderClass} from "../../common";
import handler from "../__handler/handler";

export default class Range {
    public bodyHTML: string;
    public startHandler: HandlerView;
    public endHandler: HandlerView;
    private _element: Element;

    constructor(firstHandler: HandlerView, secondHandler?: HandlerView) {
        if (secondHandler)
            this.arrangeHandlers(firstHandler, secondHandler);

        if (firstHandler.isStart)
            this.startHandler = firstHandler;
        else
            this.endHandler = firstHandler;

        this.bodyHTML = `<div class=${defaultSliderClass}__range></div>`;
    }

    private arrangeHandlers(firstHandler: HandlerView, secondHandler: HandlerView) {
        if (firstHandler.positionPart <= secondHandler.positionPart) {
            this.startHandler = firstHandler;
            this.endHandler = secondHandler;
        } else {
            this.startHandler = secondHandler;
            this.endHandler = firstHandler;
        }
    };

    public addHandler(handler: HandlerView) {

    }

    public removeHandler(handler: HandlerView) {

    }

    public isHandlerInRange(handler: HandlerView) {
        return handler === this.startHandler || handler === this.endHandler;
    }
}
