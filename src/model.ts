import {Listenable, standardize} from "./common";
import HandlerModel from "./handlerModel";

export default class Model implements Listenable {
    listenDictionary: {[key: string] : { func: Function, listeners: Function[] }};
    private _items: Array<any>;

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

    constructor(parameters?: {
                    isRange?: boolean,
                    min?: number,
                    max?: number,
                    step?: number,
                    items?: Array<any>, //если задан, то оперируемые значения - это индексы массива
                    values?: number[], //значения стандартных хэндлеров
                    handlers?: {
                        value?: number,
                    }[],
                }
    ) {
        this._setMinMax(parameters);
        this._setStep(parameters);
        this.setItems(parameters?.items);

        if (parameters?.handlers?.length) {
            //если передаются кастомные хэндлеры
            this.withCustomHandlers = true;
            this._createHandlers(parameters.handlers);
        } else {
            this.withCustomHandlers = false;
            this._generateDefaultHandlersItemIndexes(parameters?.isRange ? 2 : 1, parameters?.values);
        }
    }

    public setItems(items: any[]) {
        if (items?.length) {
            //если передаётся массив своих значений
            this._items = items;
            this.setItemsMinMax(items.length);
        } else {
            this._items = null;
        }
    }

    /**
     * Устанавливает шаг значений, используемый в слайдере.
     * @param data
     *      @param data.items - пользовательские значения. Если переданы - шаг должен быть целым числом, поскольку работа будет с массивом.
     * @private
     */
    private _setStep(data?: { step?: number, items?: Array<any> }) {
        if (!data?.step)
            return;

        if (data.items) {
            this._step = Math.round(data.step);
        } else {
            this._step = data.step;
        }
    }


    /**
     * Устанавливает минимальное и максимальное значение слайдера.
     * Если передаются items, то устанавливаются начальный  конечный индексы массива.
     * Иначе назначаются переданные минимум и максимум.
     * Если ничего не передано, то остаются прежние значения.
     * @param data
     * @private
     */
    private _setMinMax(data?: { min?: number, max?: number, items?: Array<any> }) {
        if (data?.items?.length) {
            this.setItemsMinMax(data.items.length);
        } else {
            if (data?.min !== undefined) {
                this._min = data.min;
            }
            if (data?.max !== undefined) {
                this._max = data.max;
            }
        }
    }

    private setItemsMinMax(itemsCount: number) {
        this._min = 0;
        this._max = itemsCount - 1;
    }


    private _createHandlers(handlersItemIndexes: { value?: number }[]) {
        if (!handlersItemIndexes?.length)
            return;

        this._occupiedItems = [];
        this._handlers = [];
        const reducer = (newValueIndexes, handler, handlerIndex) => {
            const itemIndex = standardize(handler.value, this.standardizeParams);

            const newHandler = this._createHandler(itemIndex, handlerIndex);
            if (newHandler !== null) {
                newValueIndexes.push(newHandler);
            }

            return newValueIndexes;
        };

        //Значение хэндлера - номер значения в массиве значений (если они заданы), либо число
        this._handlers = handlersItemIndexes.reduce(reducer, []);
    }

    public calculateValue(valueOrIndex: number): any {
        return this._items ? this._items[valueOrIndex] : valueOrIndex;
    }

    private _generateDefaultHandlersItemIndexes(handlersCount: number, itemIndexes?: number[]) {
        this._handlers = [];
        const part = this.range / (handlersCount + 1);

        let handlersItemIndexes = [];
        for (let i = 0; i < handlersCount; i++) {
            if (Number.isFinite(itemIndexes?.[i])) {
                handlersItemIndexes.push({
                    value: standardize(itemIndexes[i], this.standardizeParams)
                });
            } else {
                handlersItemIndexes.push({
                    value: standardize(this._min + (i + 1) * part, this.standardizeParams)
                });
            }
        }

        this._createHandlers(handlersItemIndexes);
    }

    /**
     * Создаёт и возвращает новый хэндлер.
     * При занятости запрашиваемого значения ищёт свободное, если свободных нет - возвращает null
     * @param itemIndex
     * @param handlerIndex
     */
    private _createHandler(itemIndex: number, handlerIndex: number): HandlerModel {
        let freeItemIndex: number;

        freeItemIndex = this.getFirstFreeItemIndex(itemIndex);
        if (freeItemIndex === null) {
            return null;
        }

        const handlerValue = this._items?.length > 0 ? (this._items[freeItemIndex]) : (freeItemIndex);
        return new HandlerModel(handlerValue, freeItemIndex, handlerIndex, this);
    };


    public handlerValueChanged(handler: HandlerModel) {
        return {index: handler.handlerIndex, position: handler.position, value: handler.value}
    };

    //для передачи контролеру
    public getHandlersData(): {
        customHandlers: boolean,
        handlersArray: { index: number, value: any, positionPart: number }[]
    } {
        return {
            customHandlers: this.withCustomHandlers,
            handlersArray: this._handlers.map(
                handler => ({index: handler.handlerIndex, value: handler.value, positionPart: handler.position})
            )
        };
    }

    public getSliderData() {
        return {
            step: this._step / this.range,
        };
    }

    private _getItemIndexFromPosition(position: number): number {
        return standardize((this._min + position * this.range), this.standardizeParams);
    }

    /**
     * Обрабатывает изменение позиции хэндлера, устанавливая значение, соответствующее пришедшей позиции
     * @param data
     * @param data.index индекс хэндлера
     * @param data.position новая позиция, полученная от контроллера
     */
    public handleHandlerPositionChanged(data: { index: number, position: number }): void {
        const newStandardPosition = this._getItemIndexFromPosition(data.position);

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

        for (
            let i = standardize(start, this.standardizeParams);
            i <= standardize(end, this.standardizeParams);
            i += this._step
        ) {
            if (!this.checkItemOccupancy(i)) {
                result = i;
                break;
            }
        }

        return result;
    }
}
