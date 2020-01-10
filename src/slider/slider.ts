import HandlerView from "./__handler/handler";
import Range from "./__range/range";
import {
    addClass,
    addListenerAfter,
    calculateElementCenter,
    clamp,
    defaultSliderClass,
    Listenable,
    standardize
} from "../common";
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

    get scaleStart(): number {
        return this._isVertical ?
            this._element.scale.getBoundingClientRect().bottom :
            this._element.scale.getBoundingClientRect().left;
    }

    get scaleEnd(): number {
        return this._isVertical ?
            this._element.scale.getBoundingClientRect().top :
            this._element.scale.getBoundingClientRect().right;
    }

    private _handlers: HandlerView[];
    get handlers() {
        return this._handlers;
    }

    private _activeHandler: HandlerView;

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
            this.handleMouseDown.bind(this)
        );
        document.body.addEventListener(
            "mouseup",
            this.handleMouseUp.bind(this)
        );
    }

    private _mouseMoveListener = this.handleMouseMove.bind(this); //хранится для корректного удаления слушателя

    private handleMouseUp(event: MouseEvent): void {
        this._activeHandler = null;

        document.body.removeEventListener("mousemove", this._mouseMoveListener);
    }

    private handleMouseDown(event: MouseEvent): void {
        this._activeHandler = this.getClosestToMouseHandler(event.pageX, event.pageY);

        document.body.addEventListener("mousemove", this._mouseMoveListener);
    }

    private handleMouseMove(event: MouseEvent) {
        const closestHandler = this.getClosestToMouseHandler(event.pageX, event.pageY);

        if (closestHandler !== this._activeHandler)
            return;

        this._activeHandler = closestHandler;

        const mousePosition = this.calculateMouseRelativePosition(event);
        const standardMousePosition = standardize(mousePosition, {min: 0, max: 1, step: this._step});

        if (standardMousePosition === closestHandler.positionPart)
            return;

        this._parentView.handlerPositionChanged(closestHandler.index, standardMousePosition);
    }

    //возвращает позицию мыши относительно начала шкалы в стндартизированном виде
    public calculateMouseRelativePosition(mouseEvent: MouseEvent): number {
        return this.isVertical ?
            clamp((mouseEvent.pageY - this.scaleStart) / this.scaleSize, 0, 1) :
            clamp((mouseEvent.pageX - this.scaleStart) / this.scaleSize, 0, 1);
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

    public initHandlers(handlers: { index: number, value: any, position: number }[]) {
        this._handlers = [];
        handlers.forEach(handlerData => {
            this._handlers.push(new HandlerView(this, handlerData));
        });
    }

    public setHandlersData(handlers: { index: number, value: any, position: number }[]) {
        handlers.forEach((handler, index) => {
            this._handlers[handler.index].index = handler.index;
            this._handlers[handler.index].value = handler.value;
            this._handlers[handler.index].setPosition(handler.position);
            //console.log(`pos: ${handler.position} val: ${handler.value} i: ${handler.index}`)
        })
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
