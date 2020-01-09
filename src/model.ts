import {addListenerAfter, clamp, Listenable, removeListener, standardize} from "./common";

export default class Model implements Listenable {
    private _items: Array<any>;
    private _min = 0;
    get min() {
        return this._min;
    }

    private _max = 10;
    get max() {
        return this._max;
    }

    private _step = 1;
    private _handlers: HandlerModel[];

    listenDictionary: { function: Function, listeners: Function[] };

    constructor(parameters: {
                    isRange?: boolean,
                    min?: number,
                    max?: number,
                    step?: number,
                    items?: Array<any>, //если задан, то оперируемые значения это индексы массива
                    values?: number, //значения стандартных хэндлеров
                    handlers?: {
                        value: number,
                    }[],
                }
    ) {
        this.setMinMax(parameters);
        this.setStep(parameters);
        this.setItems(parameters.items);

        if (parameters.handlers?.length) {
            //если передаются кастомные хэндлеры
            this.generateHandlersFromObj(parameters.handlers);
        } else {
            this.generateDefaultHandlers(parameters.isRange ? 2 : 1);
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


    private generateHandlersFromObj(objects: { value: number }[]) {
        this._handlers = [];
        this._handlers = objects.map((handler, index) => {
            const valueIndex = standardize(
                handler.value,
                {min: this._min, max: this._max, step: this._step}
            );

            const value = this.calculateHandlerValue(valueIndex);
            return this.createHandler(value, index);
        });
    }

    private calculateHandlerValue(valueOrIndex: number): any {
        let result: any;

        if (this._items) {
            result = this._items[valueOrIndex];
        } else {
            result = valueOrIndex;
        }

        return result;
    }

    private generateDefaultHandlers(handlersCount: number) {
        this._handlers = [];

        const range = this._max - this._min;

        if (handlersCount === 1) {
            const value = standardize(
                this._min + range / 2,
                {min: this._min, max: this._max, step: this._step}
            );
            this._handlers.push(this.createHandler(value, this._handlers.length));
        } else {
            const part = standardize(
                range / (handlersCount - 1),
                {min: this._min, max: this._max, step: this._step}
            );
            for (let i = 0; i < handlersCount; i++) {
                const valueIndex = i * part;
                this._handlers.push(this.createHandler(valueIndex, this._handlers.length));
            }
        }
    }

    private createHandler(valueIndex: number, index: number): HandlerModel {
        let handlerValue = this._items?.length > valueIndex ? this._items[valueIndex] : valueIndex;

        const newHandler = new HandlerModel(handlerValue, valueIndex, index, this);
        addListenerAfter(newHandler.setValueIndex.name, this.handlerValueChanged.bind(this), newHandler);

        return newHandler;
    };


    private handlerValueChanged(handler: HandlerModel) {

    };

    //для передачи контролеру
    public getHandlersData(): {index: number, value: any, position: number }[] {
        return this._handlers.map(
            handler => ({index: handler.index, value: handler.value, position: handler.position})
        );
    }

    public getSliderData() {
        let result = {
            step: this._step / (this._max - this._min),
        };

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
        public valueIndex: number, //нужно для вычисления положения
        public index: number,
        private readonly parentSlider: Model,
    ) {
        this.updatePosition();
    }

    private calculatePosition() {
        return clamp(
            ((this.valueIndex - this.parentSlider.min) / (this.parentSlider.max - this.parentSlider.min)),
            0, 1
        );
    }

    private updatePosition() {
        this._position = this.calculatePosition();
    }

    public setValueIndex(newValueIndex: number,) {
        this.valueIndex = newValueIndex;
        this.updatePosition();
    }

    public getPosition() {
        return this._position;
    }
}
