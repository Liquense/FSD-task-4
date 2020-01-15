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

    private _handlers: HandlerView[] = [];
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
    private _ranges: Range[] = [];

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

    //возвращает хэндлеры не в ренджах
    private getFreeHandlers(): HandlerView[] {
        return this._handlers.filter(handler => !handler.inRange);
    }

    private sortHandlersByValue() {
        function handlersComparing(firstHandler: HandlerView, secondHandler: HandlerView) {
            if (firstHandler.value > secondHandler.value)
                return 1;
            if (firstHandler.value < secondHandler.value)
                return -1;

            return 0;
        }

        this._handlers.sort(handlersComparing);
    }

    private findSuitableHandler(firstHandlerIndex: number, firstHandler: HandlerView, handlers: HandlerView[]): HandlerView {
        let suitableHandler: HandlerView = undefined;

        handlers.some(((handler, i) => {
                if (!handler.inRange)
                    if (((firstHandler.isEnd) && (i < firstHandlerIndex) && handler.isStart) ||
                        (firstHandler.isStart && (i > firstHandlerIndex) && handler.isEnd)) {
                        suitableHandler = handler;
                        return true;
                    }
            }
        ));

        return suitableHandler;
    }

    public createRanges(): void {
        this.sortHandlersByValue();
        let freeHandlers = this.getFreeHandlers();

        for (let i = 0; i < freeHandlers.length; i++) {
            const handler = freeHandlers[i];
            if (this._ranges.slice(-1)[0]?.hasHandler(handler))
                continue;
            if (handler.isEnd === null)
                continue;

            let secondHandler: HandlerView = undefined;
            //от начала координат до первого хэндлера || от последнего хэндлера до концац координат
            if (((i === 0) && handler.isEnd) || ((i === freeHandlers.length - 1) && handler.isStart)) {
                secondHandler = null;
            } else { //остальные случаи
                secondHandler = this.findSuitableHandler(i, handler, freeHandlers);
            }
            if (secondHandler === undefined)
                continue;

            this._ranges.push(new Range(this._element.scale, handler, secondHandler));
            handler.inRange = true;
            if (secondHandler)
                secondHandler.inRange = true;
        }
        console.log(this._ranges);
    }

    public initHandlers(handlersData: {
                            customHandlers: boolean,
                            handlersArray: { index: number, value: any, position: number }[]
                        }
    ) {
        this._handlers = handlersData.handlersArray.map((handler, index, handlers) => {
            let newHandler = new HandlerView(this, handler);

            if (!handlersData.customHandlers) {
                if ((handlers.length === 2) && (index === 0)) {
                    newHandler.isStart = true;
                }
            }

            return newHandler;
        });
    }

    public setHandlersData(handlers: { index: number, value: any, position: number }[]) {
        handlers.forEach(({index, value, position}) => {
            this._handlers[index].index = index;
            this._handlers[index].value = value;

            this._handlers[index].setPosition(position);
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
