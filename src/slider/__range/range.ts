import HandlerView from "../__handler/handler";
import {addClass, addClasses, addListenerAfter, defaultSliderClass} from "../../common";
import Slider from "../slider";

export default class Range {
    private readonly _defaultClass = `${defaultSliderClass}__range`;
    private bodyHTML: string = `<div class=${this._defaultClass}></div>`;
    public startHandler: HandlerView;
    public endHandler: HandlerView;
    private _element: Element;

    constructor(private parentSlider: Slider, public parentElement: Element, firstHandler: HandlerView, secondHandler?: HandlerView) {
        if (secondHandler)
            this.arrangeHandlers(firstHandler, secondHandler);
        else {
            if (firstHandler.isStart)
                this.startHandler = firstHandler;
            else
                this.endHandler = firstHandler;
        }

        this.createElement();
        requestAnimationFrame(this.updatePosition.bind(this));
        //слушаем изменения хэндлеров, между которыми ренж
        addListenerAfter("updatePosition", this.updatePosition.bind(this), this.startHandler);
        addListenerAfter("updatePosition", this.updatePosition.bind(this), this.endHandler);
    }

    private createElement(): void {
        let body = document.createElement("div");

        this._element = body;
        addClass(body, `${this._defaultClass}`);

        this.parentElement.appendChild(body);
    }

    public updatePosition() {
        const startCoordinate = this.startHandler ?
            this.startHandler.positionCoordinate - this.parentSlider.scaleStart :
            0;
        const endCoordinate = this.endHandler ?
            this.endHandler.positionCoordinate - this.parentSlider.scaleStart :
            this.parentSlider.scaleEnd;
        let offset = startCoordinate + this.parentSlider.scaleBorderWidth;
        let width = endCoordinate - startCoordinate;

        this._element.setAttribute(
            "style",
            `left: ${offset}px; width: ${width}px`
        );
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

    public hasHandler(handler: HandlerView) {
        return handler === this.startHandler || handler === this.endHandler;
    }
}
