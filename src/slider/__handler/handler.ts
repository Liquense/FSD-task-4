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
        this.createElement(parentSlider.bodyHTML);

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

    private updatePosition() {
        const handlerWidth = this.width;
        const tooltipWidth = this._tooltip?.width;
        const sliderWidth = this.parentSlider.width;
        const workZone = sliderWidth - handlerWidth;
        const shift = workZone * this._positionPart - 0.5 * Math.abs(handlerWidth - tooltipWidth);

        this._element.wrap.setAttribute(
            "style",
            `left: ${shift}px`
        );

        this._tooltip?.updatePosition();
    }

    private moveTo() {

    }

    public getRelativePosition() {

    }
}
