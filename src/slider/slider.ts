import HandlerView from "./__handler/handler";
import RangeView from "./__range/rangeView";
import {
    addListenerAfter,
    clamp,
    defaultSliderClass,
    KeyStringObj,
    Listenable,
    roundToDecimal,
    standardize
} from "../common";
import View from "../view";
import MarkupView from "./_markup/markup";

export default class Slider implements Listenable {
    listenDictionary: { [key: string]: { func: Function, listeners: Function[] } };

    private static _defaultSliderClass = "liquidSlider";
    private _elements: {
        [key: string]: HTMLElement,
        wrap: HTMLElement,
        body: HTMLElement,
        scale: HTMLElement,
        handlers: HTMLElement,
        min: HTMLElement,
        max: HTMLElement
    };

    public rangePairOptions = new Map()
        .set(null, null)
        .set(`start`, false)
        .set(`end`, true);
    private rangePairStartKey = `start`;
    private rangePairEndKey = `end`;

    get bodyElement(): HTMLElement {
        return this._elements.body;
    }

    get handlersElement(): HTMLElement {
        return this._elements.handlers;
    }

    get scaleStart(): number {
        return this.isVertical ?
            this._elements.scale.getBoundingClientRect().top :
            this._elements.scale.getBoundingClientRect().left;
    }

    get scaleEnd(): number {
        return this.isVertical ?
            this._elements.scale.getBoundingClientRect().bottom :
            this._elements.scale.getBoundingClientRect().right;
    }

    get scaleBorderWidth(): number {
        return Number.parseFloat(
            getComputedStyle(this._elements.scale).getPropertyValue(`border-${this.offsetDirection}-width`)
        );
    }

    private _handlerSize: number = 0;

    get shrinkCoeff() {
        return this.getWorkZoneLength() / this.getScaleLength();
    }

    private setHandlerSize() {
        const exemplarHandler = this._handlers[0];
        this._handlerSize = exemplarHandler.size;
    }

    get handlerSize() {
        return this._handlerSize;
    };

    private _handlers: HandlerView[] = [];
    get handlers() {
        return this._handlers;
    }

    private _activeHandler: HandlerView;

    public isVertical = false;
    public isReversed = false;
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

    private _step: number = 0.01; //относительное значение

    private _min: number; //индексы первого и последнего значений
    private _max: number;

    private _ranges: RangeView[] = [];


    public getScaleLength(): number {
        return Number.parseFloat(
            (<KeyStringObj>this._elements.scale.getBoundingClientRect())[this.expandDimension]
        );
    }

    constructor(private _parentView: View,
                parameters?: {
                    isVertical?: boolean,
                    showTooltips?: boolean,
                    isReversed?: boolean,
                    isRange?: boolean,
                    withMarkup?: boolean,
                }
    ) {
        if (parameters?.isVertical !== undefined)
            this.isVertical = parameters.isVertical;
        if (parameters?.isReversed !== undefined)
            this.isReversed = parameters.isReversed;
        if (parameters?.showTooltips !== undefined)
            this._tooltipsAreVisible = parameters.showTooltips;
        if (parameters?.withMarkup !== undefined)
            this._withMarkup = parameters.withMarkup;

        this._createElements(_parentView.element);
        this.setMouseEvents();
    }

    private _createElements(parentElement: HTMLElement) {
        this._elements = {
            wrap: document.createElement("div"),
            body: document.createElement("div"),
            scale: document.createElement("div"),
            handlers: document.createElement("div"),
            min: document.createElement("span"),
            max: document.createElement("span"),
        };

        let wrap = this._elements.wrap;
        wrap.classList.add(defaultSliderClass);
        parentElement.replaceWith(wrap);

        Object.keys(this._elements).forEach((elementName) => {
            const element = this._elements[elementName];
            element.classList.add(`${defaultSliderClass}__${elementName}`);

            switch (elementName) {
                case "wrap":
                    break;
                case "body":
                    element.addEventListener("mousedown", (event) => event.preventDefault()); //чтобы не возникало drag-n-drop (с ondragstart не работает)
                    wrap.append(element);
                    break;
                case "min":
                case "max":
                    wrap.append(element);
                    break;
                default:
                    this._elements.body.append(element);
                    break;
            }
        });

        this.setOrientation(this.isVertical);
    };

    public setOrientation(newState: boolean) {
        const operableObjects: KeyStringObj[] = [this._elements];

        if (this._markup?.wrap) {
            operableObjects.push({wrap: this._markup.wrap});
        }

        this._handlers.forEach(handler => {
            operableObjects.push(handler.element)
            operableObjects.push(handler.tooltip.element);
        });

        this._ranges.forEach(range => {
            operableObjects.push(range);
        })

        const oldOrientClass = this.getOrientationClass();
        this.isVertical = newState;
        const newOrientClass = this.getOrientationClass();

        operableObjects.forEach(obj => {
            for (let key in obj) {
                if (obj[key]?.classList) {
                    obj[key].classList.remove(oldOrientClass);
                    obj[key].classList.add(newOrientClass);
                }
            }
        });
    }

    public setTooltipsVisibility(stateToSet?: boolean): void {
        let stateToPass = (stateToSet === undefined) || (stateToSet === null) ?
            (this._tooltipsAreVisible) : (stateToSet);

        this._tooltipsAreVisible = stateToPass;
        this._handlers.forEach(handler => {
            handler.setTooltipVisibility(stateToPass);
        })
    }

    public getOrientationClass(): string {
        return this.isVertical ? `${defaultSliderClass}_vertical` : `${Slider._defaultSliderClass}_horizontal`;
    }

    private setMouseEvents() {
        document.body.addEventListener(
            "mousedown",
            this._handleDocumentMouseDown.bind(this)
        );
        this._elements.body.addEventListener(
            "mousedown",
            this._handleMouseDown.bind(this)
        );
        document.body.addEventListener(
            "mouseup",
            this._handleMouseUp.bind(this)
        );
    }

    private _boundHandleWindowMouseOut = this._handleWindowMouseOut.bind(this);

    private _handleWindowMouseOut(event: MouseEvent) {
        const from = event.target as HTMLElement;
        if (from.nodeName === "HTML")
            document.body.removeEventListener("mousemove", this._handleMouseMoveBound);
    }

    private _handleDocumentMouseDown(event: MouseEvent) {
        let target = (event.target) as HTMLElement;
        if (!this._elements.wrap.contains(target)) {
            this.deactivateActiveHandler();
        }
    }

    private _handleMouseMoveBound = this._handleMouseMove.bind(this); //хранится для корректного удаления слушателя

    private _handleMouseUp(): void {
        document.body.removeEventListener("mousemove", this._handleMouseMoveBound);
        document.body.removeEventListener("mouseout", this._handleWindowMouseOut);
    }

    private _handleMouseDown(event: MouseEvent): MouseEvent {
        const closestHandler = this.getClosestToMouseHandler(event.clientX, event.clientY);

        if (!closestHandler)
            return event;

        this.activateHandler(closestHandler);
        this._activeHandler.body.focus();

        this._handleMouseMove(event);
        document.body.addEventListener("mousemove", this._handleMouseMoveBound);

        //проверка на выход за пределы окна браузера
        window.addEventListener("mouseout", this._boundHandleWindowMouseOut);

        return event; //для обработки события пользовательскими функциями
    }

    private _handleMouseMove(event: MouseEvent) {
        const closestHandler = this.getClosestToMouseHandler(event.clientX, event.clientY);

        if (closestHandler !== this._activeHandler)
            return;

        this.activateHandler(closestHandler);

        const mousePosition = this.calculateMouseRelativePosition(event);
        const standardMousePosition = standardize(mousePosition, {min: 0, max: 1, step: this._step});

        if (standardMousePosition === roundToDecimal(closestHandler.positionPart, 4))
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
        const mouseCoordinate = this.isVertical ? mouseEvent.clientY : mouseEvent.clientX;
        const initialOffset = this.handlerSize / 2;
        const scaledCoordinate = (mouseCoordinate - this.scaleStart - initialOffset) / this.shrinkCoeff;

        return clamp((scaledCoordinate) / this.getScaleLength(), 0, 1);
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

    private findSuitableHandler(firstHandler: HandlerView): HandlerView {
        return this._handlers.find(handler => handler.index === firstHandler.rangePair);
    }

    public clearRanges(): void {
        this._ranges.forEach((range) => {
            range.remove()
        });
        this._ranges = [];
    }

    public createRanges(): void {
        this.clearRanges();

        this._handlers.forEach((handler) => {
            const newRange = this._createRange(handler);
            if (newRange)
                this._ranges.push(newRange);
        });
    }

    private _createRange(handler: HandlerView): RangeView {
        if (handler.rangePair === null)
            return;

        let secondHandler = this.findSuitableHandler(handler);

        //если хэндлера с нужным индексом не находится и пара не нужна
        if (!secondHandler
            && (handler.rangePair !== this.rangePairStartKey && handler.rangePair !== this.rangePairEndKey)
        )
            return;

        return new RangeView(this, this._elements.scale, handler, secondHandler);
    }

    private _initMarkup() {
        this._markup = new MarkupView(this);
        this._updateMarkup();
    }

    private _updateMarkup() {
        if (!this._markup)
            return;

        this._markup.clearAllMarks();

        if (!this._withMarkup)
            return;

        requestAnimationFrame(() => {
            for (let i = 0; i <= 1; i = roundToDecimal(i + this._step, 5)) { //i округляется, чтобы не всплывало ошибок деления
                const standardPosition = standardize(i, {min: 0, max: 1, step: this._step});
                const shrinkPosition = standardPosition * this.shrinkCoeff;
                this._markup.addMark(shrinkPosition, this.calcRelativeHandlerSize());
            }
        });
    }

    public initHandlers(
        handlersData: {
            customHandlers: boolean,
            handlersArray: {
                index: number,
                positionPart: number,
                value: any,
                withTooltip?: boolean,
                rangePair?: string,
            }[]
        }) {
        this._clearHandlers();

        this._handlers = handlersData.handlersArray.map((handler, index, handlers) => {
            let newHandler = new HandlerView(this, {...handler, withTooltip: this._tooltipsAreVisible});

            //если хэндлеры дефолтные, то им присваиваются подходящие пары
            if (!handlersData.customHandlers) {
                if (handlers.length === 2) {
                    if (index === 0)
                        newHandler.rangePair = this.isReversed ? this.rangePairStartKey : 1;
                    if (index === 1)
                        newHandler.rangePair = this.isReversed ? this.rangePairEndKey : 0;
                } else {
                    newHandler.rangePair = this.isReversed ? this.rangePairEndKey : this.rangePairStartKey;
                }
            }

            return newHandler;
        });

        this.setHandlerSize();
        this._initMarkup();
    }

    public addHandler(handlerParams: { positionPart: number, value: any, handlerIndex: number, rangePair: number | string }) {
        if (!handlerParams)
            return;

        const newHandler = new HandlerView(
            this,
            {
                index: handlerParams.handlerIndex,
                value: handlerParams.value, positionPart: handlerParams.positionPart,
                rangePair: handlerParams.rangePair,
                withTooltip: this._tooltipsAreVisible
            }
        );

        this._handlers.push(newHandler);
        const newRange = this._createRange(newHandler);
        if (newRange)
            this._ranges.push(newRange);
    }

    public removeHandler(handlerIndex: number) {
        const handlerToRemoveIndex = this._handlers.findIndex(handler => handler.index === handlerIndex);
        const handlerToRemove = this._handlers[handlerToRemoveIndex];

        const rangesToRemove = this._ranges.map((range) => {
            if (range.hasHandler(handlerToRemove)) {
                return range;
            }
        });

        rangesToRemove.forEach(range => {
            if (!range)
                return;

            const rangeIndex = this._ranges.indexOf(range);
            range.remove();
            this._ranges.splice(rangeIndex, 1);
        });

        handlerToRemove.remove();
        this._handlers.splice(handlerToRemoveIndex, 1);
    }

    private _clearHandlers() {
        this.clearRanges();
        this._elements.handlers.innerHTML = "";
        this._handlers = [];
    }

    public getWorkZoneLength(): number {
        let handlerSize = this.handlerSize;
        const scaleSize = this.getScaleLength();
        return scaleSize - handlerSize;
    }

    public calculateHandlerOffset(relativePosition: number): number {
        return this.getWorkZoneLength() * relativePosition;
    }

    public calcRelativeHandlerSize() {
        return this.handlerSize / this.getWorkZoneLength();
    }

    public setHandlersData(handlers: { index: number, item: any, relativeValue: number }[]) {
        handlers.forEach(({index, item, relativeValue}) => {
            const realIndex = this._handlers.findIndex(handler => handler.index === index);
            if (realIndex === -1)
                return;

            this._handlers[realIndex].setValue(item);
            this._handlers[realIndex].setPosition(relativeValue);
        })
    }

    //обновление информации для отображения (для изменений после создания)
    public update(
        data?:
            {
                min?: number, max?: number, step?: number,
                isVertical?: boolean, tooltipsVisible?: boolean, withMarkup?: boolean
            }
    ) {
        if (Number.isFinite(data?.step)) {
            this._step = data.step;
        }
        if (Number.isFinite(data?.min)) {
            this._min = data.min;
        }
        if (Number.isFinite(data?.max)) {
            this._max = data.max;
        }
        if (data?.tooltipsVisible !== undefined) {
            this.setTooltipsVisibility(data.tooltipsVisible);
        }
        if (data?.isVertical !== undefined) {
            this.setOrientation(data.isVertical);
        }
        if (data?.withMarkup !== undefined) {
            this._withMarkup = data.withMarkup;
        }

        this._refreshElements();
    }

    private _refreshElements() {
        this._updateMarkup();

        this._ranges.forEach(range => {
            range.refreshPosition();
        });

        this._handlers.forEach(handler => {
            handler.refreshPosition();
        });

        this._elements.min.innerText = this._min?.toFixed(2);
        this._elements.max.innerText = this._max?.toFixed(2);
    }

    public addOnMouseDownListener(listener: Function) {
        this._elements.body.removeEventListener("mousedown", this._handleMouseDown);

        addListenerAfter(this._handleMouseDown.name, listener, this);

        this._elements.body.addEventListener("mousedown", this._handleMouseDown);
    }
}
