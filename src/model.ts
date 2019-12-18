import {addListener, clamp, Listenable, removeListener} from "./common";

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

    public listenDictionary: { function: Function, listeners: Function[] };

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

        if (parameters.handlers && parameters.handlers.length > 0) {
            //если передаются кастомные хэндлеры
            this.generateHandlersFromObj(parameters.handlers);
        } else {
            this.generateDefaultHandlers(parameters.isRange ? 2 : 1);
        }
    }

    private setItems(items: any[]) {
        if (items && items.length > 0)
            //если передаётся массив своих значений
            this._items = items;
        else {
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

    //region MinMax setting
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
        this._max = itemsCount - 1;
    }

    //endregion

    //region Handlers generation
    private generateHandlersFromObj(objects: { value: number }[]) {
        this._handlers = [];
        this._handlers = objects.map((handler) => {
            const valueIndex = this.standardize(handler.value);

            const value = this.calculateHandlerValue(valueIndex);
            return this.createHandler(value);
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
            const value = this.standardize(this._min + range / 2);
            this._handlers.push(this.createHandler(value));
        } else {
            const part = this.standardize(range / (handlersCount - 1));
            for (let i = 0; i < handlersCount; i++) {
                const valueIndex = i * part;
                this._handlers.push(this.createHandler(valueIndex));
            }
        }
    }

    private createHandler(valueIndex: number) {
        let handlerValue = this._items && this._items.length > 0 ? this._items[valueIndex] : valueIndex;

        const newHandler = new HandlerModel(handlerValue, valueIndex, this._handlers.length, this);
        addListener(newHandler.setValueIndex.name, this.handlerValueChanged.bind(this), newHandler);

        return newHandler;
    };

    //endregion

    private handlerValueChanged(handler: HandlerModel) {

    };

    //для передачи контролеру
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
        private _value: any, //непосредственно значение
        public valueIndex: number, //нужно для вычисления положения
        public handlerIndex: number,
        private readonly parentSlider: Model,
    ) {
        this.calculatePosition();
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
