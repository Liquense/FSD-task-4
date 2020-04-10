import {calculateElementCenter, defaultSliderClass, Listenable, parseClassesString} from "../../common";
import Tooltip from "./__tooltip/tooltip";
import Slider from "../slider";

export default class HandlerView implements Listenable {
    listenDictionary: {[key: string] : { func: Function, listeners: Function[] }};
    public index: number;

    private _defaultClass = `${defaultSliderClass}__handler`;

    private _additionalClasses: string[] = [];
    private readonly _tooltip: Tooltip;

    public setValue(value: any) {
        this._tooltip.value = value;
    }

    get value(): any {
        return this._tooltip.value;
    }

    get positionCoordinate(): number {
        return calculateElementCenter(this._element.body, this.ownerSlider.isVertical);
    }

    private _positionPart: number;
    get positionPart(): number {
        return this._positionPart;
    }


    private _element: {
        wrap: HTMLElement,
        body: HTMLElement,
    };

    get wrap(): HTMLElement {
        return this._element.wrap;
    };

    get body(): HTMLElement {
        return this._element.body;
    };

    get width(): number {
        return this._element.body.getBoundingClientRect().width;
    }

    get height(): number {
        return this._element.body.getBoundingClientRect().height;
    }


    private _isEnd: boolean = null;
    get isEnd() {
        return this._isEnd === undefined ? null : this._isEnd;
    };

    get isStart(): boolean {
        return (this._isEnd === undefined) || (this._isEnd === null) ? null : !this._isEnd;
    }

    set isEnd(value: boolean) {
        this._isEnd = value;
    };

    set isStart(value: boolean) {
        this._isEnd = value === null ? null : !value;
    }


    public inRange: boolean = false;

    constructor(public ownerSlider: Slider,
                params:
                    {
                        index: number,
                        positionPart: number,
                        value: any,
                        withTooltip?: boolean,
                        isEnd?: boolean,
                    }
    ) {
        if (params.isEnd !== undefined)
            this._isEnd = params.isEnd;
        this.index = params.index;
        this._positionPart = params.positionPart;

        this.createElement(ownerSlider.handlersElement);

        const withTooltip = params.withTooltip === undefined ? true : params.withTooltip;
        this._tooltip = new Tooltip(this._element.wrap, this, {visibilityState: withTooltip});
        this.setValue(params.value);

        requestAnimationFrame(this.refreshPosition.bind(this));
    }

    private createElement(parentElement: HTMLElement): void {
        let wrap = document.createElement("div");
        let body = document.createElement("div");
        const orientationClass = this.ownerSlider.getOrientationClass();

        this._element = {wrap, body};
        this._element.body.setAttribute("tabindex", "-1");

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
        let tooltipSize = this._tooltip.getSize();

        const tooltipExcess = Math.max(0, tooltipSize - handlerSize);

        return (shift - 0.5 * tooltipExcess);
    }

    private calculateAccurateOffset(): number {
        let shift = this.calculateOffset();

        return this.centerShift(shift);
    }

    public refreshPosition(): void {
        const offset = this.calculateAccurateOffset();

        this._element.wrap.style[this.ownerSlider.offsetDirection] = `${offset}px`;
        this._tooltip.updateHTML();
    }

    public setPosition(newPositionPart: number) {
        this._positionPart = newPositionPart;
        if (this._element)
            this.refreshPosition();
    }

    public setTooltipVisibility(stateToSet: boolean) {
        this._tooltip.setVisibility(stateToSet);
    }
}
