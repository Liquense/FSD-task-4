import HandlerView from "../__handler/handler";
import {addListenerAfter, defaultSliderClass, removeListener} from "../../common";
import Slider from "../slider";

export default class RangeView {
    private static readonly _defaultClass = `${defaultSliderClass}__range`;
    public startHandler: HandlerView;
    public endHandler: HandlerView;
    private _element: HTMLElement;
    private handlerRefreshPositionName = `refreshPosition`;

    constructor(private parentSlider: Slider, public parentElement: HTMLElement, firstHandler: HandlerView, secondHandler?: HandlerView) {
        if (secondHandler)
            this.arrangeHandlers(firstHandler, secondHandler);
        else {
            this.startHandler = parentSlider.rangePairOptions.get(firstHandler.rangePair) ? firstHandler : null;
            this.endHandler = parentSlider.rangePairOptions.get(firstHandler.rangePair) ? null : firstHandler;
        }

        this.createElement();
        requestAnimationFrame(this.refreshPosition.bind(this));
        //слушаем изменения хэндлеров, между которыми ренж
        if (this.startHandler)
            addListenerAfter(this.handlerRefreshPositionName, this._boundRefreshPosition, this.startHandler);
        if (this.endHandler)
            addListenerAfter(this.handlerRefreshPositionName, this._boundRefreshPosition, this.endHandler);
    }

    private createElement(): void {
        let body = document.createElement("div");
        const orientationClass = this.parentSlider.getOrientationClass();

        this._element = body;
        body.classList.add(`${RangeView._defaultClass}`, orientationClass);

        this.parentElement.appendChild(body);
    }

    private _boundRefreshPosition = this.refreshPosition.bind(this);

    public refreshPosition() {
        const firstCoordinate = this.startHandler ?
            this.startHandler.positionCoordinate - this.parentSlider.scaleStart :
            this.parentSlider.scaleBorderWidth;
        const secondCoordinate = this.endHandler ?
            this.endHandler.positionCoordinate - this.parentSlider.scaleStart :
            this.parentSlider.scaleEnd - this.parentSlider.scaleStart - this.parentSlider.scaleBorderWidth;

        const startCoordinate = Math.min(firstCoordinate, secondCoordinate);
        const endCoordinate = Math.max(firstCoordinate, secondCoordinate);

        let offset = startCoordinate;
        let length = endCoordinate - startCoordinate;

        this._element.style.removeProperty("left");
        this._element.style.removeProperty("top");
        this._element.style.removeProperty("width");
        this._element.style.removeProperty("height");

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

    public hasHandler(handler: HandlerView) {
        return handler === this.startHandler || handler === this.endHandler;
    }

    public remove() {
        removeListener(this.handlerRefreshPositionName, this._boundRefreshPosition, this.startHandler);
        removeListener(this.handlerRefreshPositionName, this._boundRefreshPosition, this.endHandler);
        this._element.remove();
    };
}
