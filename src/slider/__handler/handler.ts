import {calculateElementCenter, defaultSliderClass, Listenable} from "../../common";
import Tooltip from "./__tooltip/tooltip";
import Slider from "../slider";

export default class HandlerView implements Listenable {
    listenDictionary: {[key: string] : { func: Function, listeners: Function[] }};
    public index: number;

    private _defaultClass = `${defaultSliderClass}__handler`;

    private _additionalClasses: string[] = [];
    public readonly tooltip: Tooltip;

    public setValue(value: any) {
        this.tooltip.value = value;
    }

    get value(): any {
        return this.tooltip.value;
    }

    get positionCoordinate(): number {
        return calculateElementCenter(this.element.body, this.ownerSlider.isVertical);
    }

    private _positionPart: number;
    get positionPart(): number {
        return this._positionPart;
    }


    public element: {
        wrap: HTMLElement,
        body: HTMLElement,
    };

    get wrap(): HTMLElement {
        return this.element.wrap;
    };

    get body(): HTMLElement {
        return this.element.body;
    };

    get width(): number {
        return this.element.body.getBoundingClientRect().width;
    }

    get height(): number {
        return this.element.body.getBoundingClientRect().height;
    }


    public rangePair: number | string;

    constructor(public ownerSlider: Slider,
                params:
                    {
                        index: number,
                        positionPart: number,
                        value: any,
                        withTooltip?: boolean,
                        rangePair?: number | string,
                    }
    ) {
        this.rangePair = params.rangePair;
        this.index = params.index;
        this._positionPart = params.positionPart;

        this.createElement(ownerSlider.handlersElement);

        const withTooltip = params.withTooltip === undefined ? true : params.withTooltip;
        this.tooltip = new Tooltip(this.element.wrap, this, {visibilityState: withTooltip});
        this.setValue(params.value);

        requestAnimationFrame(this.refreshPosition.bind(this));
    }

    private createElement(parentElement: HTMLElement): void {
        let wrap = document.createElement("div");
        let body = document.createElement("div");
        const orientationClass = this.ownerSlider.getOrientationClass();

        this.element = {wrap, body};
        this.element.body.setAttribute("tabindex", "-1");

        wrap.classList.add(`${this._defaultClass}Container`, orientationClass);
        wrap.classList.add(...this._additionalClasses);
        parentElement.appendChild(wrap);

        body.classList.add(`${this._defaultClass}Body`, orientationClass);
        wrap.appendChild(body);
    };


    get size(): number {
        return this[this.ownerSlider.expandDimension];
    }

    public calculateOffset(): number {
        return this.ownerSlider.calculateHandlerOffset(this._positionPart);
    }

    //добавляется смещение для правильного отображения хэндлера и тултипа, если тултип больше
    private centerShift(shift): number {
        let handlerSize = this.size;
        let tooltipSize = this.tooltip.getSize();

        const tooltipExcess = Math.max(0, tooltipSize - handlerSize);

        return (shift - 0.5 * tooltipExcess);
    }

    private calculateAccurateOffset(): number {
        let shift = this.calculateOffset();

        return this.centerShift(shift);
    }

    public refreshPosition(): void {
        const offset = this.calculateAccurateOffset();

        this.element.wrap.style.removeProperty("left");
        this.element.wrap.style.removeProperty("top");

        this.element.wrap.style[this.ownerSlider.offsetDirection] = `${offset}px`;
        this.tooltip.updateHTML();
    }

    public setPosition(newPositionPart: number) {
        this._positionPart = newPositionPart;
        if (this.element)
            this.refreshPosition();
    }

    public setTooltipVisibility(stateToSet: boolean) {
        this.tooltip.setVisibility(stateToSet);
    }
}
