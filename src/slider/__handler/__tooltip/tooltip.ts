import {addClass, defaultSliderClass, parseClassesString} from "../../../common";

export default class Tooltip {
    private static positions = {left: "left", right: "right", up: "up", down: "down"};
    public value: any;
    public innerHTML = `${this.value}`;
    private _element: Element;
    private readonly _defaultClass = defaultSliderClass + "__tooltip";
    private _currentPosition: string;

    private _additionalClasses: string[];
    set additionalClasses(classesString: string) {
        this._additionalClasses = parseClassesString(classesString);
    }

    constructor(parentElement: Element, sliderIsVertical: boolean, additionalClass?: string, position?: string, bodyHTML?: string) {
        let defaultParameters = this.initDefaultParameters(sliderIsVertical);
        let parameters = {...defaultParameters, ...arguments};

        this.additionalClasses = parameters.additionalClass;
        this._currentPosition = parameters.position;
        this.createElement(parentElement);
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

    private createElement(parentElement: Element) {
        this._element = document.createElement("span");
        addClass(this._element, `${this._defaultClass}`);
        this._element.innerHTML = this.innerHTML;

        parentElement.appendChild(this._element);
    }
}
