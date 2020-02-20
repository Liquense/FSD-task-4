import {clamp, Listenable, standardize} from "./common";

export default class Model implements Listenable {
    private _items: Array<any>;

    private getItem(itemIndex) {
        if (this._items)
            return this._items[standardize(itemIndex, this.standardizeParams)];
        else
            return standardize(itemIndex, this.standardizeParams);
    };

    private _occupiedItems: { [key: number]: number } = {};
    private _min = 0;
    get min() {
        return this._min;
    }

    private _max = 10;
    get max() {
        return this._max;
    }

    get range(): number {
        return this._max - this._min;
    }

    private _step = 1;

    get standardizeParams() {
        return {
            min: this._min,
            max: this._max,
            step: this._step
        };
    }

    private _handlers: HandlerModel[] = [];

    public withCustomHandlers: boolean;

    listenDictionary: { function: Function, listeners: Function[] };

    constructor(parameters: {
                    isRange?: boolean,
                    min?: number,
                    max?: number,
                    step?: number,
                    items?: Array<any>, //если задан, то оперируемые значения это индексы массива
                    values?: number[], //значения стандартных хэндлеров
                    handlers?: {
                        value?: number,
                    }[],
                }
    ) {
        this.setMinMax(parameters);
        this.setStep(parameters);
        this.setItems(parameters.items);

        if (parameters.handlers?.length) {
            //если передаются кастомные хэндлеры
            this.withCustomHandlers = true;
            this.createCustomHandlers(parameters.handlers);
        } else {
            this.withCustomHandlers = false;
            this.generateDefaultHandlers(parameters.isRange ? 2 : 1, parameters.values);
        }
    }

    private setItems(items: any[]) {
        if (items?.length) {
            //если передаётся массив своих значений
            this._items = items;
        } else {
            this._items = null;
        }
    }

    private setStep(data: { step?: number, items?: Array<any> }) {
        if (!data.step)
            return;

        if (data.items) {
            this._step = Math.round(data.step);
        } else {
            this._step = data.step;
        }
    }


    private setMinMax(data: { min?: number, max?: number, items?: Array<any> }) {
        if (data.items?.length) {
            this.setNotNumericMinMax(data.items.length);
        } else {
            this.setNumericMinMax(data.min, data.max);
        }
    }

    private setNumericMinMax(min: number, max: number) {
        if (min)
            this._min = min;
        if (max)
            this._max = max;
    }

    private setNotNumericMinMax(itemsCount: number) {
        this._min = 0;
        this._max = itemsCount - 1;
    }


    private createCustomHandlers(customHandlers: { value?: number }[]) {
        this._handlers = [];

        this._handlers = customHandlers.map((handler, index) => {
            const itemIndex = Number.isFinite(handler.value) ?
                standardize(handler.value, this.standardizeParams) :
                undefined;
            const value = this.calculateValue(itemIndex);

            const newHandler = this.createHandler(value, index);
            if (newHandler !== null)
                return newHandler;
        });

        this._handlers.forEach((handler, index) => {
            if (handler.value === undefined) {
                const itemIndex = this._min + (this.range / (this._handlers.length + 1)) * (index + 1);
                this.setHandlerItem(handler, itemIndex);
            }
        });
    }

    public setHandlerItem(handler: HandlerModel, itemIndex: number) {
        const valueIsOccupied = this.checkItemOccupancy(itemIndex);
        const newItemIndex = valueIsOccupied ? this.getFirstFreeItemIndex(itemIndex) : itemIndex;
        handler.setItemIndex(newItemIndex);
    }

    public calculateValue(valueOrIndex: number): any {
        let result: any;

        if (this._items) {
            result = this._items[valueOrIndex];
        } else {
            result = valueOrIndex;
        }

        return result;
    }

    private generateDefaultHandlers(handlersCount: number, itemIndexes?: number[]) {
        this._handlers = [];
        const part = this.range / (handlersCount + 1);

        for (let i = 0; i < handlersCount; i++) {
            const itemIndex = Number.isFinite(itemIndexes?.[i]) ?
                standardize(itemIndexes[i], this.standardizeParams) :
                standardize(this._min + (i + 1) * part, this.standardizeParams);

            const newHandler = this.createHandler(itemIndex, i);
            if (newHandler)
                this._handlers.push(newHandler);
        }
    }

    private createHandler(itemIndex: number, index: number): HandlerModel {
        let freeItemIndex = itemIndex;
        if (this.checkItemOccupancy(itemIndex)) {
            freeItemIndex = this.getFirstFreeItemIndex(itemIndex);
        }
        if (freeItemIndex === null)
            return null;

        const handlerValue = (this._items?.length > freeItemIndex) ? (this._items[freeItemIndex]) : (freeItemIndex);

        return new HandlerModel(handlerValue, freeItemIndex, index, this);
    };


    public handlerValueChanged(handler: HandlerModel) {
        return {index: handler.index, position: handler.position, value: handler.value}
    };

    //для передачи контролеру
    public getHandlersData(): {
        customHandlers: boolean,
        handlersArray: { index: number, value: any, positionPart: number }[]
    } {
        return {
            customHandlers: this.withCustomHandlers,
            handlersArray: this._handlers.map(
                handler => ({index: handler.index, value: handler.value, positionPart: handler.position})
            )
        };
    }

    public getSliderData() {
        return {
            step: this._step / this.range,
        };
    }

    private getValueIndexFromPosition(position: number): number {
        return standardize((this._min + position * this.range), this.standardizeParams);
    }

    public handleHandlerPositionChanged(data: { index: number, position: number }): void {
        const newStandardPosition = this.getValueIndexFromPosition(data.position);

        this._handlers[data.index].setItemIndex(newStandardPosition);
    }

    public checkItemOccupancy(itemIndex): boolean {
        return !(this._occupiedItems[itemIndex] === undefined);
    }

    public occupyItem(itemIndex: number, handlerIndex: number): void {
        this._occupiedItems[itemIndex] = handlerIndex;
    }

    public releaseItem(itemIndex: number): void {
        delete this._occupiedItems[itemIndex];
    }

    /**
     * находит первый свободный индекс значения
     * @param startIndex необязательный аргумент, если нужно начать с конкретного индекса
     */
    private getFirstFreeItemIndex(startIndex?: number): number {
        let result: number;

        const start = startIndex ? startIndex : this._min;
        result = this.findFirstFreeItemIndex(start, this._max);

        if (result === null) {
            //если ПОСЛЕ нужного индекса ничего не нашлось, с горя ищем ДО него
            result = this.findFirstFreeItemIndex(this._min, start);
        }

        return result;
    }

    private findFirstFreeItemIndex(start: number, end: number): number {
        let result: number = null;

        for (let i = start; i <= end; i += this._step) {
            if (!this.checkItemOccupancy(i)) {
                result = i;
                break;
            }
        }

        return result;
    }
}

class HandlerModel implements Listenable {
    //позиция будет передаваться между моделью и видом в виде доли,
    //потому что это обезличенные данные, которые они могут интерпретировать как им нужно
    private _position: number;

    public listenDictionary: { function: Function, listeners: Function[] };

    get value(): any {
        return this._value;
    }

    get position(): number {
        return this._position;
    }

    constructor(
        private _value: any, //непосредственно значение
        public itemIndex: number, //нужно для вычисления положения
        public index: number,
        private readonly _parentModel: Model,
    ) {
        this.setItemIndex(itemIndex);
    }

    private calculatePosition() {
        return clamp(
            ((this.itemIndex - this._parentModel.min) / this._parentModel.range),
            0,
            1
        );
    }

    private updatePosition() {
        this._position = this.calculatePosition();
        this._parentModel.handlerValueChanged(this);
    }

    public setItemIndex(newItemIndex: number,) {
        const oldItemIndex = this.itemIndex;
        if (this._parentModel.checkItemOccupancy(newItemIndex))
            return;

        this.itemIndex = newItemIndex;
        this._value = this._parentModel.calculateValue(this.itemIndex);
        this.updatePosition();

        this._parentModel.releaseItem(oldItemIndex);
        this._parentModel.occupyItem(newItemIndex, this.index);
    }
}
