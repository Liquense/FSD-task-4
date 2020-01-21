import {addClass, defaultSliderClass, parseClassesString} from "../../../common";
import HandlerView from "../handler";

export default class Tooltip {
    private static positions = {left: "left", right: "right", up: "up", down: "down"};
    private _value: any;
    set value(value) {
        this._value = value;
        this.innerHTML = value;
    }

    private _innerHTML = `${this._value}`;
    set innerHTML(value) {
        this._innerHTML = `${value}`;
        this.updateHTML();
    }

    private _element: HTMLElement;
    get element(): HTMLElement {
        return this._element;
    }

    private readonly _defaultClass = defaultSliderClass + "__handlerTooltip";
    private _currentPosition: string;

    private _additionalClasses: string[];
    set additionalClasses(classesString: string) {
        this._additionalClasses = parseClassesString(classesString);
    }

    get width(): number {
        return this.element.getBoundingClientRect().width;
    }

    get height(): number {
        return this.element.getBoundingClientRect().height;
    }

    public getSize(): number {
        if (this.sliderIsVertical)
            return this.height;
        else
            return this.width;
    }

    constructor(parentElement: HTMLElement,
                public parentHandler: HandlerView,
                additionalClass?: string,
                position?: string,
                bodyHTML?: string,
                value?: any,
    ) {
        let defaultParameters = this.initDefaultParameters(parentHandler.parentSlider.isVertical);
        let parameters = {...defaultParameters, ...arguments};

        this.additionalClasses = parameters.additionalClass;
        this._currentPosition = parameters.position;
        this.createElement(parentElement);
        this.value = value;
    }

    private initDefaultParameters(sliderIsVertical: boolean) {
        let defaultParameters = {
            additionalClass: "",
            bodyHTML: this.innerHTML,
            withTooltip: true,
            isEnd: true,
            position: undefined,
        };

        if (sliderIsVertical) {
            defaultParameters.position = Tooltip.positions.left;
        } else {
            defaultParameters.position = Tooltip.positions.up;
        }

        return defaultParameters;
    }

    private createElement(parentElement: HTMLElement) {
        this._element = document.createElement("div");
        addClass(this._element, `${this._defaultClass}`);
        this._element.innerHTML = this._innerHTML;

        parentElement.appendChild(this._element);
    }

    public updateHTML() {
        this._element.innerHTML = this._innerHTML;
    }

    public updatePosition() {
        this.updateHTML();
    }
}
