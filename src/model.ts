export default class Model {
    private _items: Array<any>;
    private _min: number;
    private _max: number;
    private _step: number;
    private _handlers: Handler[];

    constructor(parameters:
                    {
                        isRange?: boolean,
                        min?: number,
                        max?: number,
                        step?: number,
                        items?: Array<any>,
                        values?: any[],
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
            this._items = parameters.items;
        else {
            this.generateItemsArray();
        }

        if (parameters.handlers) {
            this.fillValuesFromObj(parameters.handlers);
        } else {
            this.generateHandlerValues(parameters.isRange ? 2 : 1);
        }
    }

    private generateItemsArray() {
        this._items = [];
        for (let i = this._min; i <= this._max; i += this._step) {
            this._items.push(`${i}`);
        }
    }

    private fillValuesFromObj(objects: { value: any }[]) {
        this._handlers = objects.map(handler => {
            return new Handler(handler.value, 0, 0, this);
        });
    }

    private generateHandlerValues(valuesCount: number) {
        this._handlers = [];
        let itemsCount = this._items.length - 1;

        if (valuesCount === 1) {
            const part = Math.round(itemsCount / 2);
            this._handlers.push(new Handler(this._items[part], 0, part, this));
        } else {
            const part = Math.round(itemsCount / (valuesCount - 1));
            for (let i = 0; i < valuesCount; i++) {
                const valueIndex = i * part;
                this._handlers.push(new Handler(this._items[valueIndex], 0, valueIndex, this));
            }
        }
    }

    private standardize(value: number): number {
        if (value > this._max)
            return this._max;
        if (value < this._min)
            return this._min;

        let remainder = (value - this._min) % this._step;
        if (remainder === 0)
            return value;
        if (this._step / 2 > remainder)
            return value - remainder; //ближе к нижней части шага
        else
            return value + (this._step - remainder); //ближе к верхней части
    }
}

class Handler {
    constructor(
        private _value: any,
        private _position: number,
        private _index: number,
        parentContext: Model,
    ) {

    }
}
