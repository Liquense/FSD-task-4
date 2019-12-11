import {addClass, addClasses, defaultSliderClass, parseClassesString} from "../../common";
import Tooltip from "./__tooltip/tooltip";

export default class HandlerView {
    private _defaultClass = `${defaultSliderClass}__handler`;

    private _additionalClasses: string[];
    set additionalClasses(classesString) {
        this._additionalClasses = parseClassesString(classesString);
    }

    private _tooltip: Tooltip;
    set value(value: any) {
        this._tooltip.value = value;
    }
    private _position: number;
    set position(newPosition: number) {
      this._position = newPosition;
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

    constructor(parentElement: Element,
                parameters:
                    {
                        sliderIsVertical: boolean,
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
        this.createElement(parentElement);

        this._tooltip = new Tooltip(this._element.wrap, parameters.sliderIsVertical);
    }

    createElement(parentElement: Element) {
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
}
