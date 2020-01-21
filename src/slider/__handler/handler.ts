import {
    addClass,
    addClasses,
    calculateElementCenter,
    defaultSliderClass,
    Listenable,
    parseClassesString
} from "../../common";
import Tooltip from "./__tooltip/tooltip";
import Slider from "../slider";

export default class HandlerView implements Listenable {
    listenDictionary: { function: Function, listeners: Function[] };
    public index: number;

    private _defaultClass = `${defaultSliderClass}__handler`;

    private _additionalClasses: string[];
    set additionalClasses(classesString) {
        this._additionalClasses = parseClassesString(classesString);
    }

    private _tooltip: Tooltip;

    set value(value: any) {
        if (this._tooltip)
            this._tooltip.value = value;
    }

    get positionCoordinate() {
        return calculateElementCenter(this._element.body, this.parentSlider.isVertical);
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
        return this._isEnd === null ? null : this._isEnd;
    };

    get isStart(): boolean {
        return this._isEnd === null ? null : !this._isEnd;
    }

    set isEnd(value: boolean) {
        this._isEnd = value;
    };

    set isStart(value: boolean) {
        this._isEnd = !value;
    }


    private _withTooltip: boolean;

    public showTooltip(): void {
        this._withTooltip = true;
    }

    public hideTooltip(): void {
        this._withTooltip = false;
    }

    public inRange: boolean = false;

    constructor(public parentSlider: Slider,
                parameters:
                    {
                        index: number,
                        position: number,
                        value: any,
                        withTooltip?: boolean,
                        isEnd?: boolean,
                        tooltip?: object,
                    }
    ) {
        let defaultParameters = {
            withTooltip: true,
            isEnd: true,
        };
        parameters = {...defaultParameters, ...parameters};
        this._withTooltip = parameters.withTooltip;
        this._isEnd = parameters.isEnd;
        this.createElement(parentSlider.bodyElement);

        this._tooltip = new Tooltip(this._element.wrap, this);

        this.index = parameters.index;
        this._positionPart = parameters.position;
        this.value = parameters.value;
        requestAnimationFrame(this.updatePosition.bind(this));
    }

    private createElement(parentElement: HTMLElement): void {
        let wrap = document.createElement("div");
        let body = document.createElement("div");

        this._element = {wrap, body};

        addClass(wrap, `${this._defaultClass}Container`);
        addClasses(wrap, this._additionalClasses);
        parentElement.appendChild(wrap);

        addClass(body, `${this._defaultClass}Body`);
        wrap.appendChild(body);
    };

    get size(): number {
        if (this.parentSlider.isVertical)
            return this.height;
        else
            return this.width;
    }

    private calculateOffset(): number {
        let handlerSize = this.size;
        const scaleSize = this.parentSlider.getScaleLength();
        const workZone = scaleSize - handlerSize;

        const offset = workZone * this._positionPart;
        return offset;
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

    private updatePosition(): void {
        const offset = this.calculateAccurateOffset();

        this._element.wrap.setAttribute(
            "style",
            `left: ${offset}px`
        );

        this._tooltip?.updatePosition();
    }

    public setPosition(newPositionPart: number) {
        this._positionPart = newPositionPart;
        if (this._element)
            this.updatePosition();
    }
}
