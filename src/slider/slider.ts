import HandlerView from "./__handler/handler";
import Range from "./__range/range";
import {addClass, defaultSliderClass} from "../common";

export default class Slider {
    private _DOMElement: {
        wrap: Element,
        body: Element,
        scale: Element,
    };
    private _handlers: HandlerView[];
    get handlers() {
        return this._handlers;
    }
    private _isVertical: boolean;
    private _isRange: boolean;
    private _ranges: Range[];

    constructor(parentElement: Element,
                parameters: {
                    isVertical?: boolean,
                    isRange?: boolean,
                    handlers?: object[],
                }
    ) {
        let defaultParameters = {
            isVertical: false,
            isRange: false,
        };
        parameters = {...defaultParameters, ...parameters};

        this._isVertical = parameters.isVertical;
        this._isRange = parameters.isRange;
        this._ranges = [];

        this.createElement(parentElement);
        if (!parameters.handlers)
            this.createDefaultHandlers();
    }

    private createElement(parentElement: Element) {
        this._DOMElement = {
            wrap: document.createElement("div"),
            body: document.createElement("div"),
            scale: document.createElement("div")
        };
        let wrap = this._DOMElement.wrap;
        addClass(wrap, defaultSliderClass);
        let body = this._DOMElement.body;
        addClass(body, `${defaultSliderClass}__body`);
        let scale = this._DOMElement.scale;
        addClass(scale, `${defaultSliderClass}__scale`);

        parentElement.replaceWith(wrap);
        wrap.appendChild(body);
        body.appendChild(scale);
    };

    private createUniqueRange(handler: HandlerView) {
        const foundedRanges = this._ranges.filter(range => {
            if (Object.values(range).includes(handler)) {
                return range;
            }
        });

        if (foundedRanges.length > 0)
            return;

        this._ranges.push(new Range(handler));
    };

    private createDefaultHandlers() {
        if (this._isRange) {
            let startHandler = new HandlerView(this._DOMElement.body, {sliderIsVertical: this._isVertical});
            let endHandler = new HandlerView(this._DOMElement.body, {sliderIsVertical: this._isVertical});
            this._handlers = [startHandler, endHandler];
        } else {
            this._handlers = [new HandlerView(this._DOMElement.body, {sliderIsVertical: this._isVertical})];
        }
    };

    public setHandlersData(handlers: {value: number, position: number}[]) {
        handlers.forEach((handler, index) => {
            this._handlers[index].position = handler.position;
            this._handlers[index].value = handler.value;
        })
    }
}
