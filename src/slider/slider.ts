import HandlerView from "./__handler/handler";
import Range from "./__range/range";
import {addClass, addListenerAfter, calculateElementCenter, defaultSliderClass, Listenable, standardize} from "../common";
import View from "../view";

export default class Slider implements Listenable {
    listenDictionary: { function: Function, listeners: Function[] };

    private _element: {
        wrap: Element,
        body: Element,
        scale: Element,
    };

    get bodyElement(): Element {
        return this._element.body;
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
    private _step: number; //относительное значение
    private _ranges: Range[];

    get scaleSize() {
        if (this.isVertical)
            return this.bodyElement.getBoundingClientRect().height;
        else
            return this.bodyElement.getBoundingClientRect().width;
    }

    constructor(private _parentView: View,
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

        this.createElement(_parentView.element);
        this.setMouseEvents();
    }

    private createElement(parentElement: Element) {
        this._element = {
            wrap: document.createElement("div"),
            body: document.createElement("div"),
            scale: document.createElement("div")
        };
        let wrap = this._element.wrap;
        addClass(wrap, defaultSliderClass);

        let body = this._element.body;
        body.addEventListener("mousedown", (event) => event.preventDefault());
        addClass(body, `${defaultSliderClass}__body`);

        let scale = this._element.scale;
        addClass(scale, `${defaultSliderClass}__scale`);

        parentElement.replaceWith(wrap);
        wrap.appendChild(body);
        body.appendChild(scale);
    };


    private setMouseEvents() {
        this._element.body.addEventListener(
            "mousedown",
            (event) => this.handleMouseDown(event)
        );
        document.body.addEventListener(
            "mouseup",
            (event) => {
                document.body.removeEventListener("mousemove", this._mouseMoveListener);
            }
        );
    }

    private _mouseMoveListener = this.handleMouseMove.bind(this); //хранится для корректного удаления слушателя

    private handleMouseDown(event): void {
        document.body.addEventListener("mousemove", this._mouseMoveListener);
    }

    private handleMouseMove(event): void {
        const closestHandler = this.getClosestToMouseHandler(event.pageX, event.pageY);
        //const handlerCenter = calculateBodyCenter(closestHandler.body, this._isVertical);
        const workZonePadding = closestHandler.size / 2;
        const start = this.bodyElement.getBoundingClientRect().left + workZonePadding;
        const end = this.bodyElement.getBoundingClientRect().right - workZonePadding;
        //const workZone = this.scaleSize - closestHandler.size;
        const stepVew = this.scaleSize * this._step;

        const mousePosition = this._isVertical ? event.pageY : event.pageX;
        const standardMousePosition = standardize(mousePosition, {min: start, max: end, step: stepVew});
        this._parentView.handlerPositionChanged(closestHandler.index, standardMousePosition);
    }

    public calculateHandlerRelativePosition(): number {
        const handlerCenter = calculateElementCenter(this._element.scale, this._isVertical);
        const sliderRect = this._element.scale.getBoundingClientRect();

        return this.isVertical ? handlerCenter - sliderRect.top : handlerCenter - sliderRect.left;
    }

    private getClosestToMouseHandler(mouseX: number, mouseY: number): HandlerView {
        return this._isVertical ? this.findClosestHandler(mouseY) : this.findClosestHandler(mouseX);
    }

    private findClosestHandler(mouseCoordinate: number): HandlerView {
        let minDistance = Number.MAX_VALUE;
        let closestHandler: HandlerView;

        for (let handler of this._handlers) {
            const distance = Math.abs(handler.positionCoordinate - mouseCoordinate);

            if (minDistance > distance) {
                closestHandler = handler;
                minDistance = distance;
            }
        }

        return closestHandler;
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

    public createHandlers(handlers: {index: number, value: any, position: number }[]) {
        handlers.forEach(handlerData => {
            this._handlers.push(new HandlerView(this, handlerData));
        });
    }

    public setHandlersData(handlers: {index: number, value: any, position: number }[]) {
        if (!(handlers.length === this._handlers?.length)) {
            this._handlers = [];
            this.createHandlers(handlers);
        } else {
            handlers.forEach((handler, index) => {
                this._handlers[index].positionPart = handler.position;
                this._handlers[index].value = handler.value;
                this._handlers[index].index = handler.index;
            })
        }
    }

    public update(data: { step?: number }) {
        if (data.step)
            this._step = data.step;
    }

    public addOnMouseDownListener(listener: Function) {
        this._element.body.removeEventListener("mousedown", this.handleMouseDown);

        addListenerAfter(this.handleMouseDown.name, listener, this);

        this._element.body.addEventListener("mousedown", this.handleMouseDown);
    }
}
