import HandlerView from "./__handler/handler";
import Range from "./__range/range";
import {addClass, addListenerAfter, defaultSliderClass, Listenable, standardize} from "../common";
import handler from "./__handler/handler";
import * as webpack from "webpack";
import Handler = webpack.Compiler.Watching.Handler;
import Func = Mocha.Func;

export default class Slider implements Listenable {
    listenDictionary: { function: Function, listeners: Function[] };

    private _DOMElement: {
        wrap: Element,
        body: Element,
        scale: Element,
    };

    get bodyHTML(): Element {
        return this._DOMElement.body;
    }

    private _handlers: HandlerView[];
    get handlers() {
        return this._handlers;
    }

    private _isVertical: boolean;
    get isVertical(): boolean {
        return this._isVertical;
    }

    private _isRange: boolean;
    private _step: number;
    private _ranges: Range[];

    get width() {
        return this.bodyHTML.getBoundingClientRect().width;
    }

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
        this.setMouseEvents();
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


    private setMouseEvents() {
        this._DOMElement.body.addEventListener(
            "mousedown",
            (...args) => this.onMouseDown.call(this, ...args)
        );
        this._DOMElement.body.addEventListener(
            "mouseup",
            (...args) => this.removeMouseMoveListener.call(this, ...args)
        );
        this._DOMElement.body.addEventListener(
            "mouseleave",
            (...args) => this.removeMouseMoveListener.call(this, ...args)
        );
    }

    private onMouseDown(eventArgs) {
        this._DOMElement.body.addEventListener("mousemove", this.onMouseMove);
        this._handlers[0].positionPart = 0;
    }

    private removeMouseMoveListener(eventArgs) {
        this._DOMElement.body.removeEventListener("mousemove", this.onMouseMove);
    }

    private onMouseMove(eventArgs) {

    }

    private getClosestHandler(mouseX: number, mouseY: number): HandlerView {


        return this._handlers[0];
    }

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

    public createHandlers(handlers: { value: any, position: number }[]) {
        this._handlers = [];
        handlers.forEach(handlerData => {
            this._handlers.push(new HandlerView(this, handlerData));
        });
    }

    public setHandlersData(handlers: { value: any, position: number }[]) {
        if (!(handlers.length === this._handlers?.length)) {
            this.createHandlers(handlers);
        } else {
            handlers.forEach((handler, index) => {
                this._handlers[index].positionPart = handler.position;
                this._handlers[index].value = handler.value;
            })
        }
    }

    public update(data: { step?: number }) {
        if (data.step)
            this._step = data.step;
    }

    public addOnMouseDownListener(listener: Function) {
        this._DOMElement.body.removeEventListener("mousedown", this.onMouseDown);

        addListenerAfter(this.onMouseDown.name, listener, this);

        this._DOMElement.body.addEventListener("mousedown", this.onMouseDown);
    }
}
