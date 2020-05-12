import { standardize } from '../utils/common';
import { Presentable } from '../utils/types';
import HandlerModel, { ModelItemManager, SliderDataContainer } from './handlerModel';
import { Listenable } from '../utils/interfaces';

export default class SliderModel implements Listenable, SliderDataContainer, ModelItemManager {
    listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

    private _items: Array<Presentable>;

    private _occupiedItems: { [key: number]: number } = {};

    private _min = 0;

    get min(): number {
      return this._min;
    }

    private _max = 10;

    get max(): number {
      return this._max;
    }

    get range(): number {
      return this._max - this._min;
    }

    private _step = 1;

    private _handlers: HandlerModel[] = [];

    private withCustomHandlers: boolean;

    constructor(parameters?: {
        isRange?: boolean;
        min?: number;
        max?: number;
        step?: number;
        items?: Array<Presentable>; // если задан, то оперируемые значения - это индексы массива
        values?: number[]; // значения стандартных хэндлеров
        handlers?: {
            itemIndex: number;
        }[];
    }) {
      this.setMinMax(parameters);
      this.setStep(parameters);
      this.setItems(parameters?.items);

      if (parameters?.handlers?.length) {
        // если передаются кастомные хэндлеры
        this.withCustomHandlers = true;
        this._createHandlers(parameters.handlers);
      } else {
        this.withCustomHandlers = false;
        this._generateDefaultHandlersItemIndexes(parameters?.isRange ? 2 : 1, parameters?.values);
      }
    }

    private updateHandlersPositions(): void {
      this._handlers.forEach((handler) => {
        handler.setItemIndex(standardize(handler.itemIndex, this.getStandardizeParams()));
      });
    }

    public addHandler(
      itemIndex: number,
    ): { positionPart: number; item: Presentable; handlerIndex: number; itemIndex: number } {
      const indexes = this._handlers.map((handler) => handler.handlerIndex);
      const newHandlerIndex = Math.max(-1, ...indexes) + 1;

      const newHandler = this._createHandler(itemIndex, newHandlerIndex);
      if (newHandler) {
        this._handlers.push(newHandler);
        newHandler.handlerIndex = newHandlerIndex;
        this.withCustomHandlers = true;

        return {
          positionPart: newHandler.position,
          item: newHandler.item,
          handlerIndex: newHandler.handlerIndex,
          itemIndex: newHandler.itemIndex,
        };
      }
      return null;
    }

    /*
  Удаляет хэндлер под указанным индексом (handlerModel.index).
  Возвращает false, если хэндлер с таким индексом не найден.
   */
    public removeHandler(handlerIndex: number): boolean {
      const handlerToRemoveIndex = this._handlers.findIndex(
        (handler) => handler.handlerIndex === handlerIndex,
      );
      if (handlerToRemoveIndex < 0) {
        return false;
      }

      this.releaseItem(this._handlers[handlerToRemoveIndex].itemIndex);
      this._handlers.splice(handlerToRemoveIndex, 1);
      return true;
    }

    public calculateValue(valueOrIndex: number): Presentable {
      return this._items ? this._items[valueOrIndex] : valueOrIndex;
    }

    private _generateDefaultHandlersItemIndexes(
      handlersCount: number, itemIndexes?: number[],
    ): void {
      this._handlers = [];
      const part = this.range / (handlersCount + 1);

      const handlersItemIndexes = [];
      for (let i = 0; i < handlersCount; i += 1) {
        if (Number.isFinite(itemIndexes?.[i])) {
          handlersItemIndexes.push({
            itemIndex: standardize(itemIndexes[i], this.getStandardizeParams()),
          });
        } else {
          handlersItemIndexes.push({
            itemIndex: standardize(this._min + (i + 1) * part, this.getStandardizeParams()),
          });
        }
      }

      this._createHandlers(handlersItemIndexes);
    }

    public setItems(items: Presentable[]): void {
      if (items?.length) {
        // если передаётся массив своих значений
        this._items = items;
        this._initItemsMinMax(items.length);
      } else {
        this._items = null;
      }
    }

    /**
     * Устанавливает шаг значений, используемый в слайдере.
     * @param data
     *      @param data.items - пользовательские значения.
     *      Если переданы - шаг должен быть целым числом, поскольку работа будет с массивом.
     * @private
     */
    public setStep(data?: { step?: number; items?: Presentable[] }): void {
      if (!data?.step) { return; }

      this._step = data.items ? Math.round(data.step) : data.step;

      this.updateHandlersPositions();
    }

    /**
     * Устанавливает минимальное и максимальное значение слайдера.
     * Если ничего не передано, то остаются прежние значения.
     * @param data
     * @private
     */
    public setMinMax(data?: { min?: number; max?: number }): void {
      const newMinGreaterThanOldMax = data?.min > this._max;
      const newMaxLesserThanOldMin = data?.max < this._min;
      const singleExtremumChecks = (newMinGreaterThanOldMax || newMaxLesserThanOldMin);
      const maxLesserThanMin = data?.min > data?.max;

      if (singleExtremumChecks || maxLesserThanMin) { return; }

      if (data?.min !== undefined) {
        this._min = data.min;
      }
      if (data?.max !== undefined) {
        this._max = data.max;
      }

      this.updateHandlersPositions();
    }

    public handlerValueChanged(changedHandler: HandlerModel):
    { index: number; relativeValue: number; item: Presentable} {
      const changedHandlerIndex = this._handlers.findIndex(
        (handler) => handler.handlerIndex === changedHandler.handlerIndex,
      );

      if (changedHandlerIndex === -1) {
        return null;
      }

      return {
        index: changedHandler.handlerIndex,
        relativeValue: changedHandler.position,
        item: changedHandler.item,
      };
    }

    // для передачи контролеру
    public getHandlersData(): {
    customHandlers: boolean;
    handlersArray: {
      handlerIndex: number; item: Presentable; positionPart: number; itemIndex: number;
    }[];
    } {
      return {
        customHandlers: this.withCustomHandlers,
        handlersArray: this._handlers.map(
          (handler) => ({
            handlerIndex: handler.handlerIndex,
            item: handler.item,
            positionPart: handler.position,
            itemIndex: handler.itemIndex,
          }),
        ),
      };
    }

    public getSliderData(): {step: number; absoluteStep: number; min: number; max: number} {
      return {
        step: this._step / this.range,
        absoluteStep: this._step,
        min: this._min,
        max: this._max,
      };
    }

    /**
   * Обрабатывает изменение позиции хэндлера, устанавливая значение,
   * соответствующее пришедшей позиции
   * @param data
   * @param data.index индекс хэндлера
   * @param data.position новая позиция, полученная от контроллера
   */
    public handleHandlerPositionChanged(data: { index: number; position: number }): void {
      const newStandardPosition = this._getItemIndexFromPosition(data.position);

      const movingHandlerIndex = this._handlers.findIndex(
        (handler) => handler.handlerIndex === data.index,
      );
      this._handlers[movingHandlerIndex].setItemIndex(newStandardPosition);
    }

    public checkItemOccupancy(itemIndex: number): boolean {
      return !(this._occupiedItems[itemIndex] === undefined);
    }

    public occupyItem(itemIndex: number, handlerIndex: number): void {
      this._occupiedItems[itemIndex] = handlerIndex;
    }

    public releaseItem(itemIndex: number): void {
      delete this._occupiedItems[itemIndex];
    }

    private getStandardizeParams(): {min: number; max: number; step: number} {
      return {
        min: this._min,
        max: this._max,
        step: this._step,
      };
    }

    private _initItemsMinMax(itemsCount: number): void {
      this._min = 0;
      this._max = itemsCount - 1;
    }


    private _createHandlers(handlersItemIndexes: { itemIndex: number }[]): void {
      if (!handlersItemIndexes?.length) {
        return;
      }

      this._occupiedItems = [];
      this._handlers = [];
      const reducer = (
        newHandlers: HandlerModel[], handler: {itemIndex?: number},
      ): HandlerModel[] => {
        const itemIndex = standardize(handler.itemIndex, this.getStandardizeParams());

        const newHandler = this._createHandler(itemIndex, newHandlers.length);
        if (newHandler !== null) {
          newHandlers.push(newHandler);
        }

        return newHandlers;
      };

      this._handlers = handlersItemIndexes.reduce(reducer, []);
    }

    /**
     * Создаёт и возвращает новый хэндлер.
     * При занятости запрашиваемого значения ищёт свободное, если свободных нет - возвращает null
     * @param itemIndex
     * @param handlerIndex
     */
    private _createHandler(itemIndex: number, handlerIndex: number): HandlerModel {
      const freeItemIndex = this.getFirstFreeItemIndex(itemIndex);
      if (freeItemIndex === null) {
        return null;
      }

      const handlerValue = this._items?.length > 0 ? (this._items[freeItemIndex]) : (freeItemIndex);
      return new HandlerModel(handlerValue, freeItemIndex, this, handlerIndex);
    }

    private _getItemIndexFromPosition(position: number): number {
      return (position === 1)
        ? this._max
        : standardize((this._min + position * this.range), this.getStandardizeParams());
    }

    /**
     * находит первый свободный индекс значения
     * @param startIndex необязательный аргумент, если нужно начать с конкретного индекса
     */
    private getFirstFreeItemIndex(startIndex?: number): number {
      let result: number;

      const start = startIndex || this._min;
      result = this.findFirstFreeItemIndex(start, this._max);

      if (result === null) {
        // если ПОСЛЕ нужного индекса ничего не нашлось, с горя ищем ДО него
        result = this.findFirstFreeItemIndex(this._min, start);
      }

      return result;
    }

    private findFirstFreeItemIndex(start: number, end: number): number {
      let result: number = null;

      for (
        let i = standardize(start, this.getStandardizeParams());
        i <= standardize(end, this.getStandardizeParams());
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
