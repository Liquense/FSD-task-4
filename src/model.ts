export default class Model {
    private _items: Array<any>;
    private _min: number;
    private _max: number;
    private _step: number;
    private _handlersValues: Array<number>;

    constructor(parameters:
                    {
                        min?: number,
                        max?: number,
                        step?: number,
                        items?: Array<any>,
                        values?: number[],
                        handlers?: {
                            value: number,
                        }[],
                    }
    ) {
        let defaultParameters = {
            min: 0,
            max: 100,
            step: 1,
        };
        parameters = {...defaultParameters, ...parameters};

        this._min = parameters.min;
        this._max = parameters.max;
        this._step = parameters.step;

        if (parameters.items && parameters.items.length > 0)
            this._items = parameters.items;
        else {
            this.generateItems();
        }

        if (parameters.handlers) {
            this._handlersValues = parameters.handlers.map(handler => {
                return handler.value
            });
        } else {
            console.log(this.standardize(5.6));
        }
    }

    private generateItems() {
        this._items = [];
        for (let i = this._min; i <= this._max; i += this._step) {
            this._items.push(`${i}`);
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
        if (this._step/2 > remainder)
            return value - remainder; //ближе к нижней части шага
        else
            return value + (this._step - remainder); //ближе к верхней части
    }
}
