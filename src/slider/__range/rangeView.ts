import HandlerView from "../__handler/handler";
import {addClasses, addListenerAfter, defaultSliderClass} from "../../common";
import Slider from "../slider";

export default class RangeView {
    private static readonly _defaultClass = `${defaultSliderClass}__range`;
    public startHandler: HandlerView;
    public endHandler: HandlerView;
    private _element: HTMLElement;

    constructor(private parentSlider: Slider, public parentElement: HTMLElement, firstHandler: HandlerView, secondHandler?: HandlerView) {
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
        if (this.startHandler)
            addListenerAfter("updatePosition", this.updatePosition.bind(this), this.startHandler);
        if (this.endHandler)
            addListenerAfter("updatePosition", this.updatePosition.bind(this), this.endHandler);
    }

    private createElement(): void {
        let body = document.createElement("div");
        const orientationClass = this.parentSlider.getOrientationClass(RangeView._defaultClass);

        this._element = body;
        addClasses(body, [`${RangeView._defaultClass} `, orientationClass]);

        this.parentElement.appendChild(body);
    }

    public updatePosition() {
        const startCoordinate = this.startHandler ?
            this.startHandler.positionCoordinate - this.parentSlider.scaleStart :
            0;
        const endCoordinate = this.endHandler ?
            this.endHandler.positionCoordinate - this.parentSlider.scaleStart :
            this.parentSlider.scaleEnd - this.parentSlider.scaleStart - this.parentSlider.scaleBorderWidth;
        let offset = startCoordinate + this.parentSlider.scaleBorderWidth;
        let length = endCoordinate - startCoordinate;

        this._element.style[this.parentSlider.offsetDirection] = `${offset}px`;
        this._element.style[this.parentSlider.expandDimension] = `${length}px`;
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