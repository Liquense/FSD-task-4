import HandlerView from "./__handler/handler";
import RangeView from "./__range/rangeView";
import {
    addClasses,
    addListenerAfter,
    clamp,
    defaultSliderClass,
    Listenable,
    standardize
} from "../common";
import View from "../view";
import MarkupView from "./_markup/markup";

export default class Slider implements Listenable {
    listenDictionary: { function: Function, listeners: Function[] };

    private _element: {
        wrap: HTMLElement,
        body: HTMLElement,
        scale: HTMLElement,
    };

    get bodyElement(): HTMLElement {
        return this._element.body;
    }

    get scaleStart(): number {
        return this.isVertical ?
            this._element.scale.getBoundingClientRect().top :
            this._element.scale.getBoundingClientRect().left;
    }

    get scaleEnd(): number {
        return this.isVertical ?
            this._element.scale.getBoundingClientRect().bottom :
            this._element.scale.getBoundingClientRect().right;
    }

    get scaleBorderWidth(): number {
        return Number.parseFloat(
            getComputedStyle(this._element.scale).getPropertyValue(`border-${this.offsetDirection}-width`)
        );
    }

    get handlerSize() {
        const exemplarHandler = this._handlers?.[0];

        return exemplarHandler.size;
    };

    private _handlers: HandlerView[] = [];
    get handlers() {
        return this._handlers;
    }

    private _activeHandler: HandlerView;

    public isVertical = false;
    public isReversed = true;
    private _tooltipsAreVisible = true;
    private _withMarkup = false;
    private _markup: MarkupView;

    get offsetDirection(): string {
        if (this.isVertical)
            return "top";
        else
            return "left"
    }

    get expandDimension(): string {
        if (this.isVertical)
            return "height";
        else
            return "width";
    }

    private _step: number; //относительное значение
    private _ranges: RangeView[] = [];

    public getScaleLength() {
        return this.bodyElement.getBoundingClientRect()[this.expandDimension];
    }

    constructor(private _parentView: View,
                parameters: {
                    isVertical?: boolean,
                    showTooltips?: boolean,
                    isReversed?: boolean,
                    isRange?: boolean,
                    withMarkup?: boolean,
                }
    ) {
        this.isVertical = parameters.isVertical;
        this.isReversed = parameters.isReversed;
        if (parameters.showTooltips !== undefined) {
            this._tooltipsAreVisible = parameters.showTooltips;
        }
        this._withMarkup = parameters.withMarkup;

        this.createElement(_parentView.element);
        this.setMouseEvents();
    }

    private createElement(parentElement: HTMLElement) {
        let orientationClass = this.getOrientationClass();
        this._element = {
            wrap: document.createElement("div"),
            body: document.createElement("div"),
            scale: document.createElement("div")
        };
        let wrap = this._element.wrap;
        addClasses(wrap, [defaultSliderClass, orientationClass]);
        parentElement.replaceWith(wrap);

        let body = this._element.body;
        body.addEventListener("mousedown", (event) => event.preventDefault());
        addClasses(body, [`${defaultSliderClass}__body`, orientationClass]);
        wrap.appendChild(body);

        let scale = this._element.scale;
        addClasses(scale, [`${defaultSliderClass}__scale`, orientationClass]);
        body.appendChild(scale);
    };

    public setTooltipsVisibility(stateToSet?: boolean): void {
        let stateToPass = (stateToSet !== undefined) ?
            (stateToSet) :
            (this._tooltipsAreVisible);

        this._handlers.forEach(handler => {
            handler.setTooltipVisibility(stateToPass);
        })
    }

    public getOrientationClass(): string {
        return this.isVertical ? `${defaultSliderClass}_vertical` : `${defaultSliderClass}_horizontal`;
    }

    private setMouseEvents() {
        window.addEventListener(
            "mousedown",
            this.handleWindowMouseDown.bind(this)
        );
        this._element.body.addEventListener(
            "mousedown",
            this.handleMouseDown.bind(this)
        );
        document.body.addEventListener(
            "mouseup",
            this.handleMouseUp.bind(this)
        );
    }

    private handleWindowMouseDown(event: MouseEvent) {
        let targetElement = (event.target) as HTMLElement;
        if (!this._element.wrap.contains(targetElement)) {
            this.deactivateActiveHandler();
        }
    }

    private _mouseMoveListener = this.handleMouseMove.bind(this); //хранится для корректного удаления слушателя

    private handleMouseUp(event: MouseEvent): void {
        document.body.removeEventListener("mousemove", this._mouseMoveListener);
    }

    private handleMouseDown(event: MouseEvent): void {
        this.activateHandler(this.getClosestToMouseHandler(event.pageX, event.pageY));
        this._activeHandler.body.focus();

        this.handleMouseMove(event);
        document.body.addEventListener("mousemove", this._mouseMoveListener);
    }

    private handleMouseMove(event: MouseEvent) {
        const closestHandler = this.getClosestToMouseHandler(event.pageX, event.pageY);

        if (closestHandler !== this._activeHandler)
            return;

        this.activateHandler(closestHandler);

        const mousePosition = this.calculateMouseRelativePosition(event);
        const standardMousePosition = standardize(mousePosition, {min: 0, max: 1, step: this._step});

        if (standardMousePosition === closestHandler.positionPart)
            return;

        this._parentView.handlerPositionChanged(closestHandler.index, standardMousePosition);
    }

    private deactivateActiveHandler() {
        this.activateHandler(null);
    }

    private activateHandler(handlerToActivate: HandlerView): void {
        if (!this._tooltipsAreVisible)
            this._activeHandler?.setTooltipVisibility(false); //убираем отображение тултипа с предыдущего

        this._activeHandler = handlerToActivate;

        if (!this._tooltipsAreVisible)
            handlerToActivate?.setTooltipVisibility(true);
    }

    //возвращает позицию мыши относительно начала шкалы в стндартизированном виде
    public calculateMouseRelativePosition(mouseEvent: MouseEvent): number {
        return this.isVertical ?
            clamp((mouseEvent.pageY - this.scaleStart) / this.getScaleLength(), 0, 1) :
            clamp((mouseEvent.pageX - this.scaleStart) / this.getScaleLength(), 0, 1);
    }

    private getClosestToMouseHandler(mouseX: number, mouseY: number): HandlerView {
        return this.isVertical ? this.findClosestHandler(mouseY) : this.findClosestHandler(mouseX);
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
    private static getFreeHandlers(handlersArray: HandlerView[]): HandlerView[] {
        return handlersArray.filter(handler => !handler.inRange);
    }

    private getSortedHandlersByPositionPart(): HandlerView[] {
        function handlersComparing(firstHandler: HandlerView, secondHandler: HandlerView) {
            if (firstHandler.positionPart > secondHandler.positionPart)
                return 1;
            if (firstHandler.positionPart < secondHandler.positionPart)
                return -1;

            return 0;
        }

        let arrayToSort = [...this._handlers];
        return arrayToSort.sort(handlersComparing);
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
        let sortedHandlers = this.getSortedHandlersByPositionPart();
        let freeHandlers = Slider.getFreeHandlers(sortedHandlers);

        for (let i = 0; i < freeHandlers.length; i++) {
            const handler = freeHandlers[i];
            if (this._ranges.slice(-1)[0]?.hasHandler(handler))
                continue;
            if (handler.isEnd === null)
                continue;

            let secondHandler: HandlerView = undefined;
            //от начала координат до первого хэндлера || от последнего хэндлера до конца координат
            if (((i === 0) && handler.isEnd) || ((i === freeHandlers.length - 1) && handler.isStart)) {
                secondHandler = null;
            } else { //остальные случаи
                secondHandler = this.findSuitableHandler(i, handler, freeHandlers);
            }
            if (secondHandler === undefined)
                continue;

            this._ranges.push(new RangeView(this, this._element.scale, handler, secondHandler));
            handler.inRange = true;
            if (secondHandler)
                secondHandler.inRange = true;
        }
    }

    private updateMarkup() {
        this._markup.clearAllMarks();

        if (this._withMarkup) {
            for (let i = 0; i < 1; i += this._step) {
                const standardPosition = standardize(i, {min: 0, max: 1, step: this._step});
                this._markup.addMark(standardPosition);
            }
        }
    }

    public initHandlers(
        handlersData: {
            customHandlers: boolean,
            handlersArray: {
                index: number,
                position: number,
                value: any,
            }[]
        }) {
        this._handlers = handlersData.handlersArray.map((handler, index, handlers) => {
            let newHandler = new HandlerView(
                this,
                {...handler, withTooltip: this._tooltipsAreVisible}
            );

            if (!handlersData.customHandlers) {
                if (handlers.length === 2) {
                    if (index === 0)
                        newHandler.isStart = (this.isReversed) === (handlers[0].position > handlers[1].position);
                    if (index === 1)
                        newHandler.isEnd = (this.isReversed) === (handlers[0].position > handlers[1].position);
                } else {
                    newHandler.isStart = this.isReversed;
                }
            }

            return newHandler;
        });

        this._markup = new MarkupView(this, this._element.scale);
    }

    public calculateOffset(relativePosition: number): number {
        let handlerSize = this.handlerSize;
        const scaleSize = this.getScaleLength();
        const workZone = scaleSize - handlerSize;

        return  workZone * relativePosition;
    }

    public setHandlersData(handlers: { index: number, value: any, position: number }[]) {
        handlers.forEach(({index, value, position}) => {
            this._handlers[index].value = value;
            this._handlers[index].setPosition(position);
        })
    }

    public update(data: { step?: number }) {
        if (data.step) {
            this._step = data.step;
            this.updateMarkup();
        }
    }

    public addOnMouseDownListener(listener: Function) {
        this._element.body.removeEventListener("mousedown", this.handleMouseDown);

        addListenerAfter(this.handleMouseDown.name, listener, this);

        this._element.body.addEventListener("mousedown", this.handleMouseDown);
    }
}
