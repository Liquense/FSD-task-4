import {addClass, addClasses, defaultSliderClass, parseClassesString} from "../../common";
import Tooltip from "./__tooltip/tooltip";
import Slider from "../slider";

export default class HandlerView {
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

    get isStart() {
        return !this._isEnd;
    }

    set isEnd(value) {
        this._isEnd = value;
    };

    set isStart(value: boolean) {
        this._isEnd = !value;
    }


    private _withTooltip: boolean;

    showTooltip() {
        this._withTooltip = true;
    }

    hideTooltip() {
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

    private createElement(parentElement: Element) {
        this._element = {
            wrap: document.createElement("div"),
            body: document.createElement("div")
        };
        let wrap = this._element.wrap;
        let body = this._element.body;

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
        let tooltipSize = this._tooltip.getSize();

        const scaleSize = this.parentSlider.getScaleSize();
        const workZone = scaleSize - handlerSize;

        const tooltipExcess = Math.max(0, tooltipSize - handlerSize); //насколько тултип больше хэндлера
        const shift = workZone * this._positionPart - 0.5 * tooltipExcess;

        return shift;
    }

    private updatePosition() {
        const shift = this.calculateShift();

        this._element.wrap.setAttribute(
            "style",
            `left: ${shift}px`
        );

        this._tooltip?.updatePosition();
    }

    private moveTo() {

    }

    private calculateWorkingCoordinateCenter(element): number {
        const thisRect = element.getBoundingClientRect();
        let thisCenter: number;

        if (this.parentSlider.isVertical) {
            thisCenter = (thisRect.bottom - thisRect.top) / 2;
        } else {
            thisCenter = (thisRect.right - thisRect.left) / 2;
        }

        return thisCenter;
    }

    public calculateRelativePosition(): number {
        const thisCenter = this.calculateWorkingCoordinateCenter(this._element.body);
        const sliderRect = this.parentSlider.bodyElement.getBoundingClientRect();

        return this.parentSlider.isVertical ? thisCenter - sliderRect.top : thisCenter - sliderRect.left;
    }
}
