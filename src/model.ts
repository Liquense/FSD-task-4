import {addListener, clamp, Listenable, removeListener} from "./common";

export default class Model implements Listenable {
    private _items: Array<any>;
    private _min = 0;
    private _max = 10;
    private _step = 1;
    private _handlers: HandlerModel[];

    public listenDictionary: { function: Function, listeners: Function[] };

    constructor(parameters:
                    {
                        isRange?: boolean,
                        min?: number,
                        max?: number,
                        step?: number,
                        items?: Array<any>,
                        values?: Array<any>,
                        handlers?: {
                            value: number,
                        }[],
                    }
    ) {
        this.setMinMax(parameters);
        this.setStep(parameters);

        if (parameters.items && parameters.items.length > 0)
            //если передаётся массив своих значений
            this._items = parameters.items;
        else {
            this._items = null;
        }

        if (parameters.handlers && parameters.handlers.length > 0) {
            //если передаются кастомные хэндлеры
            this.generateHandlersFromObj(parameters.handlers);
        } else {
            this.generateHandlers(parameters.isRange ? 2 : 1);
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
        if (!data.items || data.items.length === 0)
            this.setNumericMinMax(data.min, data.max);
        else {
            this.setNotNumericMinMax(data.items.length);
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
        this._max = itemsCount;
    }

    private generateHandlersFromObj(objects: { value: any }[]) {
        this._handlers = [];
        this._handlers = objects.map((handler, index) => {
            //todo: валидация значений хэндлера
            return this.createHandler(handler.value, index); //todo: должен быть индекс значения, а не хэндлера
        });
    }

    private generateHandlers(valuesCount: number) {
        this._handlers = [];

        if (this._items === null) {
            this.generateNumericHandlerValues(valuesCount);
        } else {
            this.generateArrayHandlerValues(valuesCount);
        }
    }

    private generateNumericHandlerValues(valuesCount: number) {
        const range = this._max - this._min;

        if (valuesCount === 1) {
            const value = this.standardize(this._min + range / 2);
            this._handlers.push(this.createHandler(value, value));
        } else {
            const part = this.standardize(range / (valuesCount - 1));
            for (let i = 0; i < valuesCount; i++) {
                this._handlers.push(this.createHandler(i * part, i * part));
            }
        }
    };

    private generateArrayHandlerValues(valuesCount: number) {
        let itemsCount = this._items.length - 1;

        if (valuesCount === 1) {
            const part = Math.round(itemsCount / 2);
            this._handlers.push(this.createHandler(this._items[part], part));
        } else {
            const part = Math.round(itemsCount / (valuesCount - 1));
            for (let i = 0; i < valuesCount; i++) {
                const valueIndex = i * part;
                this._handlers.push(this.createHandler(this._items[valueIndex], valueIndex));
            }
        }
    };

    private createHandler(value: number, index: number) {
        const newHandler = new HandlerModel(value, index, this._handlers.length);
        addListener(newHandler.setPosition.name, this.handlerValueChanged.bind(this), newHandler);
        newHandler.setPosition(this._min, this._max);

        return newHandler;
    };

    private handlerValueChanged(handler: HandlerModel) {
        console.log(handler);
    };

    public getHandlersData(): { value: number, position: number }[] {
        return this._handlers.map((handler) => {
            return {value: handler.value, position: handler.position};
        });
    }

    private standardize(value: number): number {
        let resultValue: number;
        let remainder = (value - this._min) % this._step;

        if (remainder === 0)
            resultValue = value;
        if (this._step / 2 > remainder)
            resultValue = value - remainder; //ближе к нижней части шага
        else
            resultValue = value + (this._step - remainder); //ближе к верхней части

        if (resultValue > this._max)
            return this._max;
        if (resultValue < this._min)
            return this._min;

        return resultValue;
    }
}

class HandlerModel implements Listenable {
    //позиция будет передаваться между моделью и видом в виде доли,
    //потому что это обезличенные данные, которые они могут интерпретировать как им нужно
    private _position: number;

    public listenDictionary: { function: Function, listeners: Function[] };

    get value() {
        return this._value;
    }

    get position() {
        return this._position;
    }


    constructor(
        private _value: any,
        public valueIndex: number, //если массив кастомных элементов
        public handlerIndex: number,
    ) {
    }

    private calculatePosition(min: number, max: number) {
        return clamp(((this.valueIndex - min) / (max - min)), 0, 1);
    }

    public setPosition(min: number, max: number, newValueIndex?: number,) {
        if (newValueIndex)
            this.valueIndex = newValueIndex;

        this._position = this.calculatePosition(min, max);
    }

    public getPosition() {
        return this._position;
    }
}
