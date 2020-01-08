import {addClass, addClasses, defaultSliderClass, parseClassesString} from "../../common";
import Tooltip from "./__tooltip/tooltip";
import Slider from "../slider";

export default class HandlerView {
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

    private _positionCoordinate: number;

    get positionCoordinate() {
        return this._positionCoordinate;
    }

    private _positionPart: number;
    set positionPart(newPosition: number) {
        this._positionPart = newPosition;
        if (this._element)
            this.updatePosition();
    };


    private _element: {
        wrap: Element,
        body: Element,
    };

    get wrap(): Element {
        return this._element.wrap;
    };

    get body(): Element {
        return this._element.body;
    };

    get width(): number {
        return this._element.body.getBoundingClientRect().width;
    }

    get height(): number {
        return this._element.body.getBoundingClientRect().height;
    }


    private _isEnd: boolean;
    get isEnd() {
        return this._isEnd;
    };

    get isStart(): boolean {
        return !this._isEnd;
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

    constructor(private parentSlider: Slider,
                parameters:
                    {
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

        this._tooltip = new Tooltip(this._element.wrap, parentSlider.isVertical);

        this._positionPart = parameters.position;
        this.value = parameters.value;
        requestAnimationFrame(this.updatePosition.bind(this));
    }

    private createElement(parentElement: Element): void {
        let wrap = document.createElement("div");
        let body = document.createElement("div");

        this._element = {wrap, body};

        addClass(wrap, `${this._defaultClass}Container`);
        addClasses(wrap, this._additionalClasses);
        parentElement.appendChild(wrap);

        addClass(body, `${this._defaultClass}Body`);
        wrap.appendChild(body);
    };

    private getSize(): number {
        if (this.parentSlider.isVertical)
            return this.height;
        else
            return this.width;
    }

    private calculateShift(): number {
        let handlerSize = this.getSize();

        const scaleSize = this.parentSlider.getScaleSize();
        const workZone = scaleSize - handlerSize;

        const shift = workZone * this._positionPart;

        return shift;
    }

    //добавляется смещение для правильного отображения хэндлера и тултипа, если тултип больше
    private centerShift(shift): number {
        let handlerSize = this.getSize();
        let tooltipSize = this._tooltip.getSize();

        const tooltipExcess = Math.max(0, tooltipSize - handlerSize);

        return shift - 0.5 * tooltipExcess;
    }

    private calculateAccurateShift(): number {
        let shift = this.calculateShift();

        return this.centerShift(shift);
    }

    private updatePosition(): void {
        const shift = this.calculateAccurateShift();

        this._element.wrap.setAttribute(
            "style",
            `left: ${shift}px`
        );
        this._positionCoordinate = this.calculateBodyCenter();

        this._tooltip?.updatePosition();
    }

    public setPosition(newCoordinate: number) {

    }

    private calculateBodyCenter(): number {
        const thisRect = this._element.body.getBoundingClientRect();
        let thisCenter: number;

        if (this.parentSlider.isVertical) {
            thisCenter = (thisRect.bottom - thisRect.top) / 2;
        } else {
            thisCenter = (thisRect.right - thisRect.left) / 2;
        }

        return thisCenter;
    }

    public calculateRelativePosition(): number {
        const thisCenter = this.calculateBodyCenter();
        const sliderRect = this.parentSlider.bodyElement.getBoundingClientRect();

        return this.parentSlider.isVertical ? thisCenter - sliderRect.top : thisCenter - sliderRect.left;
    }
}
