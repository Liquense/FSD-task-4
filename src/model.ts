import {addListener, clamp, Listenable, removeListener} from "./common";

export default class Model implements Listenable {
    private _items: Array<any>;
    private _min: number;
    private _max: number;
    private _step: number;
    private _handlers: HandlerModel[];

    public listenDictionary: { function: Function, listeners: Function[] };

    constructor(parameters:
                    {
                        isRange?: boolean,
                        min?: number,
                        max?: number,
                        step?: number,
                        items?: Array<any>, //todo: может быть стоит передавать только количество элементов
                        values?: Array<any>,
                        handlers?: {
                            value: number,
                        }[],
                    }
    ) {
        let defaultParameters = {
            min: 0,
            max: 10,
            step: 1.5,
        };
        parameters = {...defaultParameters, ...parameters};

        this._min = parameters.min;
        this._max = parameters.max;
        this._step = parameters.step;

        if (parameters.items && parameters.items.length > 0)
            //если передаётся массив своих значений
            this._items = parameters.items;
        else {
            this._items = null;
        }

        if (parameters.handlers && parameters.handlers.length > 0) {
            //если передаются кастомные хэндлеры
            this.fillValuesFromObj(parameters.handlers);
        } else {
            this.generateHandlers(parameters.isRange ? 2 : 1);
        }

        this._handlers[0].setActualPosition(100);
    }

    private fillValuesFromObj(objects: { value: any }[]) {
        this._handlers = objects.map((handler, index) => {
            return this.createHandler(handler.value, index, this._max);
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
            this._handlers.push(this.createHandler(value, value, this._max));
        } else {
            const part = this.standardize(range / (valuesCount - 1));
            for (let i = 0; i < valuesCount; i++) {
                this._handlers.push(this.createHandler(i * part, i * part, this._max));
            }
        }
    };

    private generateArrayHandlerValues(valuesCount: number) {
        let itemsCount = this._items.length - 1;

        if (valuesCount === 1) {
            const part = Math.round(itemsCount / 2);
            this._handlers.push(this.createHandler(this._items[part], part, this._max));
        } else {
            const part = Math.round(itemsCount / (valuesCount - 1));
            for (let i = 0; i < valuesCount; i++) {
                const valueIndex = i * part;
                this._handlers.push(this.createHandler(this._items[valueIndex], valueIndex, this._max));
            }
        }
    };

    private createHandler(value: number, index: number, maxValue: number) {
        const newHandler = new HandlerModel(value, index, maxValue);
        addListener("setActualPosition", this.handlerValueChanged, newHandler);

        return newHandler;
    };

    private handlerValueChanged(handler: HandlerModel) {
        console.log(handler);
    };

    public getHandlersData(): { value: number, position: number}[] {
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
    //позиция будет передаваться между моделью и видом в виде процентов,
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
        private _index: number,
        private _max: number
    ) {
        this.setActualPosition(_max);
    }

    private calculatePosition(newIndex: number) {
        return clamp(newIndex / this._max, 0, 1);
    }

    public setActualPosition(newIndex: number) {
        this._position = this.calculatePosition(newIndex);
    }

    public getActualPosition() {
        return this._position;
    }
}
