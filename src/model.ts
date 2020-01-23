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
            this.generateHandlersFromObj(parameters.handlers);
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


    private generateHandlersFromObj(objects: { value?: number }[]) {
        this._handlers = [];
        this._handlers = objects.map((handler, index) => {
            const valueIndex = standardize(
                handler.value,
                this.standardizeParams
            );

            const value = this.calculateHandlerValue(valueIndex);
            return this.createHandler(value, index);
        });
    }

    public calculateHandlerValue(valueOrIndex: number): any {
        let result: any;

        if (this._items) {
            result = this._items[valueOrIndex];
        } else {
            result = valueOrIndex;
        }

        return result;
    }

    private generateDefaultHandlers(handlersCount: number, values?: number[]) {
        this._handlers = [];

        if (handlersCount === 1) {
            const value = Number.isFinite(values?.[0]) ?
                standardize(values[0], this.standardizeParams) :
                standardize(this._min + (this.range / 2), this.standardizeParams);
            this._handlers.push(this.createHandler(value, this._handlers.length));
        } else {
            const part = this.range / (handlersCount - 1);

            for (let i = 0; i < handlersCount; i++) {
                const valueIndex = Number.isFinite(values?.[i]) ?
                    standardize(values[i], this.standardizeParams) :
                    standardize(i * part, this.standardizeParams);

                this._handlers.push(this.createHandler(valueIndex, this._handlers.length));
            }
        }
    }

    private createHandler(valueIndex: number, index: number): HandlerModel {
        let handlerValue = this._items?.length > valueIndex ? this._items[valueIndex] : valueIndex;

        return new HandlerModel(handlerValue, valueIndex, index, this);
    };


    public handlerValueChanged(handler: HandlerModel) {
        return {index: handler.index, position: handler.position, value: handler.value}
    };

    //для передачи контролеру
    public getHandlersData(): { customHandlers: boolean, handlersArray: { index: number, value: any, position: number }[] } {
        return {
            customHandlers: this.withCustomHandlers,
            handlersArray: this._handlers.map(
                handler => ({index: handler.index, value: handler.value, position: handler.position})
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

        this._handlers[data.index].setValueIndex(newStandardPosition);
    }

    public checkItemOccupancy(itemIndex): boolean {
        return !(this._occupiedItems[itemIndex] === undefined);
    }

    public occupyItem(itemIndex: number, handlerIndex: number): void {
        this._occupiedItems[itemIndex] = handlerIndex;
    }

    public freeItem(itemIndex: number): void {
        delete this._occupiedItems[itemIndex];
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
        public valueIndex: number, //нужно для вычисления положения
        public index: number,
        private readonly _parentModel: Model,
    ) {
        this.setValueIndex(valueIndex);
    }

    private calculatePosition() {
        return clamp(
            ((this.valueIndex - this._parentModel.min) / this._parentModel.range),
            0,
            1
        );
    }

    private updatePosition() {
        this._position = this.calculatePosition();
        this._parentModel.handlerValueChanged(this);
    }

    public setValueIndex(newItemIndex: number,) {
        const oldItemIndex = this.valueIndex;
        if (this._parentModel.checkItemOccupancy(newItemIndex))
            return;

        this.valueIndex = newItemIndex;
        this._value = this._parentModel.calculateHandlerValue(this.valueIndex);
        this.updatePosition();

        this._parentModel.freeItem(oldItemIndex);
        this._parentModel.occupyItem(newItemIndex, this.index);
    }
}
