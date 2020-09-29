import { standardize } from '../utils/common';
import { Presentable, Listenable } from '../utils/interfacesAndTypes';
import HandlerModel, { ModelItemManager, SliderDataContainer } from './handlerModel';

export default class SliderModel implements Listenable, SliderDataContainer, ModelItemManager {
  listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

  private items: Array<Presentable>;

  private occupiedItems: { [key: number]: number } = {};

  private min = 0;

  private max = 10;

  private step = 1;

  private handlers: HandlerModel[] = [];

  private withCustomHandlers: boolean;

  constructor(parameters?: {
    isRange?: boolean;
    min?: number;
    max?: number;
    step?: number;
    items?: Array<Presentable>;
    values?: number[];
    handlers?: {
      itemIndex: number;
    }[];
  }) {
    this.setMinMax(parameters);
    this.setStep(parameters);
    this.setItems(parameters?.items);

    if (parameters?.handlers?.length) {
      this.withCustomHandlers = true;
      this.createHandlers(parameters.handlers);
    } else {
      this.withCustomHandlers = false;
      this.generateDefaultHandlersItemIndexes(parameters?.isRange ? 2 : 1, parameters?.values);
    }
  }

  public getMin(): number {
    return this.min;
  }

  public getMax(): number {
    return this.max;
  }

  public getRange(): number {
    return this.max - this.min;
  }

  public addHandler(
    itemIndex: number,
  ): { positionPart: number; item: Presentable; handlerIndex: number; itemIndex: number } {
    const indexes = this.handlers.map((handler) => handler.handlerIndex);
    const newHandlerIndex = Math.max(-1, ...indexes) + 1;

    const newHandler = this.createHandler(itemIndex, newHandlerIndex);
    if (newHandler) {
      this.handlers.push(newHandler);
      newHandler.handlerIndex = newHandlerIndex;
      this.withCustomHandlers = true;

      return {
        positionPart: newHandler.getPosition(),
        item: newHandler.getItem(),
        handlerIndex: newHandler.handlerIndex,
        itemIndex: newHandler.itemIndex,
      };
    }
    return null;
  }

  /**
   * Удаляет хэндлер под указанным индексом (handlerModel.index).
   * Возвращает false, если хэндлер с таким индексом не найден.
   * @param handlerIndex
   */
  public removeHandler(handlerIndex: number): boolean {
    const handlerToRemoveIndex = this.handlers.findIndex(
      (handler) => handler.handlerIndex === handlerIndex,
    );
    if (handlerToRemoveIndex < 0) {
      return false;
    }

    this.releaseItem(this.handlers[handlerToRemoveIndex].itemIndex);
    this.handlers.splice(handlerToRemoveIndex, 1);
    return true;
  }

  public calculateValue(valueOrIndex: number): Presentable {
    return this.items ? this.items[valueOrIndex] : valueOrIndex;
  }

  private updateHandlersPositions(): void {
    this.handlers.forEach((handler) => {
      handler.setItemIndex(standardize(handler.itemIndex, this.getStandardizeParams()));
    });
  }

  private generateDefaultHandlersItemIndexes(
    handlersCount: number, itemIndexes?: number[],
  ): void {
    this.handlers = [];
    const part = this.getRange() / (handlersCount + 1);

    const handlersItemIndexes = [];
    for (let i = 0; i < handlersCount; i += 1) {
      if (Number.isFinite(itemIndexes?.[i])) {
        handlersItemIndexes.push({
          itemIndex: standardize(itemIndexes[i], this.getStandardizeParams()),
        });
      } else {
        handlersItemIndexes.push({
          itemIndex: standardize(this.min + (i + 1) * part, this.getStandardizeParams()),
        });
      }
    }

    this.createHandlers(handlersItemIndexes);
  }

  public setItems(items: Presentable[]): void {
    if (items?.length) {
      this.items = items;
      this.initItemsMinMax(items.length);
    } else {
      this.items = null;
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
    if (!data?.step) {
      return;
    }

    this.step = data.items ? Math.round(data.step) : data.step;

    this.updateHandlersPositions();
  }

  /**
   * Устанавливает минимальное и максимальное значение слайдера.
   * Если ничего не передано, то остаются прежние значения.
   * @param data
   * @private
   */
  public setMinMax(data?: { min?: number; max?: number }): void {
    const newMinGreaterThanOldMax = data?.min > this.max;
    const newMaxLesserThanOldMin = data?.max < this.min;
    const singleExtremumChecks = (newMinGreaterThanOldMax || newMaxLesserThanOldMin);
    const maxLesserThanMin = data?.min > data?.max;

    if (singleExtremumChecks || maxLesserThanMin) {
      return;
    }

    if (data?.min !== undefined) {
      this.min = data.min;
    }
    if (data?.max !== undefined) {
      this.max = data.max;
    }

    this.updateHandlersPositions();
  }

  public handlerValueChanged(changedHandler: HandlerModel):
    { index: number; relativeValue: number; item: Presentable } {
    const changedHandlerIndex = this.handlers.findIndex(
      (handler) => handler.handlerIndex === changedHandler.handlerIndex,
    );

    if (changedHandlerIndex === -1) {
      return null;
    }

    return {
      index: changedHandler.handlerIndex,
      relativeValue: changedHandler.getPosition(),
      item: changedHandler.getItem(),
    };
  }

  public getHandlersData(): {
    customHandlers: boolean;
    handlersArray: {
      handlerIndex: number; item: Presentable; positionPart: number; itemIndex: number;
    }[];
    } {
    return {
      customHandlers: this.withCustomHandlers,
      handlersArray: this.handlers.map(
        (handler) => ({
          handlerIndex: handler.handlerIndex,
          item: handler.getItem(),
          positionPart: handler.getPosition(),
          itemIndex: handler.itemIndex,
        }),
      ),
    };
  }

  public getSliderData(): { step: number; absoluteStep: number; min: number; max: number } {
    return {
      step: this.step / this.getRange(),
      absoluteStep: this.step,
      min: this.min,
      max: this.max,
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
    const newStandardPosition = this.getItemIndexFromPosition(data.position);

    const movingHandlerIndex = this.handlers.findIndex(
      (handler) => handler.handlerIndex === data.index,
    );
    this.handlers[movingHandlerIndex].setItemIndex(newStandardPosition);
  }

  public checkItemOccupancy(itemIndex: number): boolean {
    return !(this.occupiedItems[itemIndex] === undefined);
  }

  public occupyItem(itemIndex: number, handlerIndex: number): void {
    this.occupiedItems[itemIndex] = handlerIndex;
  }

  public releaseItem(itemIndex: number): void {
    delete this.occupiedItems[itemIndex];
  }

  private getStandardizeParams(): { min: number; max: number; step: number } {
    return {
      min: this.min,
      max: this.max,
      step: this.step,
    };
  }

  private initItemsMinMax(itemsCount: number): void {
    this.min = 0;
    this.max = itemsCount - 1;
  }


  private createHandlers(handlersItemIndexes: { itemIndex: number }[]): void {
    if (!handlersItemIndexes?.length) {
      return;
    }

    this.occupiedItems = [];
    this.handlers = [];
    const reducer = (
      newHandlers: HandlerModel[], handler: { itemIndex?: number },
    ): HandlerModel[] => {
      const itemIndex = standardize(handler.itemIndex, this.getStandardizeParams());

      const newHandler = this.createHandler(itemIndex, newHandlers.length);
      if (newHandler !== null) {
        newHandlers.push(newHandler);
      }

      return newHandlers;
    };

    this.handlers = handlersItemIndexes.reduce(reducer, []);
  }

  /**
   * Создаёт и возвращает новый хэндлер.
   * При занятости запрашиваемого значения ищёт свободное, если свободных нет - возвращает null
   * @param itemIndex
   * @param handlerIndex
   */
  private createHandler(itemIndex: number, handlerIndex: number): HandlerModel {
    const freeItemIndex = this.getFirstFreeItemIndex(itemIndex);
    if (freeItemIndex === null) {
      return null;
    }

    const handlerValue = this.items?.length > 0 ? (this.items[freeItemIndex]) : (freeItemIndex);
    return new HandlerModel(handlerValue, freeItemIndex, this, handlerIndex);
  }

  private getItemIndexFromPosition(position: number): number {
    return (position === 1)
      ? this.max
      : standardize((this.min + position * this.getRange()), this.getStandardizeParams());
  }

  /**
   * находит первый свободный индекс значения
   * @param startIndex необязательный аргумент, если нужно начать с конкретного индекса
   */
  private getFirstFreeItemIndex(startIndex?: number): number {
    let result: number;

    const start = startIndex || this.min;
    result = this.findFirstFreeItemIndex(start, this.max);

    if (result === null) {
      result = this.findFirstFreeItemIndex(this.min, start);
    }

    return result;
  }

  private findFirstFreeItemIndex(start: number, end: number): number {
    let result: number = null;

    for (
      let i = standardize(start, this.getStandardizeParams());
      i <= standardize(end, this.getStandardizeParams());
      i += this.step
    ) {
      if (!this.checkItemOccupancy(i)) {
        result = i;
        break;
      }
    }

    return result;
  }
}
