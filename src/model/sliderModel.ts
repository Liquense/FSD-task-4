import { standardize } from '../utils/functions';
import { Presentable, Listenable, SliderModelParams } from '../utils/interfaces-types';
import HandlerModel, { ModelItemManager, SliderDataContainer } from './handlerModel';

export default class SliderModel implements Listenable, SliderDataContainer, ModelItemManager {
  public listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

  private items: Array<Presentable>;

  private occupiedItems: { [key: number]: number } = {};

  private min = 0;

  private max = 10;

  private step = 1;

  private handlers: HandlerModel[] = [];

  private isHandlersCustom: boolean;

  private isItemsCustom: boolean;

  constructor({
    isRange, min, max, step, items, values, handlers,
  }: SliderModelParams = {}) {
    this.setMinMax(min, max);
    this.setItems(items);
    this.setStep(step);

    if (handlers?.length) {
      this.isHandlersCustom = true;
      this.createHandlers(handlers);
    } else {
      this.isHandlersCustom = false;
      this.generateDefaultHandlersItemIndexes(isRange ? 2 : 1, values);
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

  public getHandlersData(): {
    customHandlers: boolean;
    handlersArray: {
      handlerIndex: number; item: Presentable; positionPart: number; itemIndex: number;
    }[];
    } {
    return {
      customHandlers: this.isHandlersCustom,
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

  public addHandler(
    itemIndex: number,
  ): { positionPart: number; item: Presentable; handlerIndex: number; itemIndex: number } {
    const indexes = this.handlers.map((handler) => handler.handlerIndex);
    const newHandlerIndex = Math.max(-1, ...indexes) + 1;

    const newHandler = this.createHandler(itemIndex, newHandlerIndex);
    if (newHandler) {
      this.handlers.push(newHandler);
      newHandler.handlerIndex = newHandlerIndex;
      this.isHandlersCustom = true;

      return {
        positionPart: newHandler.getPosition(),
        item: newHandler.getItem(),
        handlerIndex: newHandler.handlerIndex,
        itemIndex: newHandler.itemIndex,
      };
    }
    return null;
  }

  public removeHandler(handlerIndex: number): number {
    const handlerToRemoveIndex = this.handlers.findIndex(
      (handler) => handler.handlerIndex === handlerIndex,
    );
    if (handlerToRemoveIndex < 0) { return null; }

    this.releaseItem(this.handlers[handlerToRemoveIndex].itemIndex);
    this.handlers.splice(handlerToRemoveIndex, 1);
    return handlerIndex;
  }

  public calculateValue(valueOrIndex: number): Presentable {
    return this.items ? this.items[valueOrIndex] : valueOrIndex;
  }

  private updateHandlersPosition(): void {
    this.handlers.forEach((handler) => {
      const standardItemIndex = standardize(handler.itemIndex, this.getStandardizeParams());
      if (standardItemIndex === handler.itemIndex) {
        handler.setItemIndex(standardize(standardItemIndex, this.getStandardizeParams()));
        return;
      }

      const newItemIndex = this.getFirstFreeItemIndex(handler.itemIndex);
      if (newItemIndex === null) { this.removeHandler(handler.handlerIndex); }

      handler.setItemIndex(standardize(newItemIndex, this.getStandardizeParams()));
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
      this.isItemsCustom = true;
      this.initItemsMinMax(items.length);
    } else {
      this.items = null;
      this.isItemsCustom = false;
    }
  }

  public setStep(step: number): void {
    if (!step) { return; }

    this.step = this.isItemsCustom ? Math.round(step) : step;
    this.updateHandlersPosition();
  }

  public setMin(min: number): void {
    if (min > this.max) { return; }

    this.min = min;
    this.updateHandlersPosition();
  }

  public setMax(max: number): void {
    if (max < this.min) { return; }

    this.max = max;
    this.updateHandlersPosition();
  }

  public setMinMax(min = this.min, max = this.max): void {
    if (Number.isFinite(min) && Number.isFinite(max)) {
      if (min > max) { return; }

      this.min = min;
      this.max = max;
    } else {
      this.setMin(min);
      this.setMax(max);
    }
  }

  public handlerValueChanged(changedHandler: HandlerModel):
    { index: number; relativeValue: number; item: Presentable } {
    const changedHandlerIndex = this.handlers.findIndex(
      (handler) => handler.handlerIndex === changedHandler.handlerIndex,
    );

    if (changedHandlerIndex === -1) { return null; }

    return {
      index: changedHandler.handlerIndex,
      relativeValue: changedHandler.getPosition(),
      item: changedHandler.getItem(),
    };
  }

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
    if (!handlersItemIndexes?.length) { return; }

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

  private createHandler(itemIndex: number, handlerIndex: number): HandlerModel {
    const freeItemIndex = this.getFirstFreeItemIndex(itemIndex);
    if (freeItemIndex === null) { return null; }

    const handlerValue = this.items?.length > 0 ? (this.items[freeItemIndex]) : (freeItemIndex);
    return new HandlerModel(handlerValue, freeItemIndex, this, handlerIndex);
  }

  private getItemIndexFromPosition(position: number): number {
    return (position === 1)
      ? this.max
      : standardize((this.min + position * this.getRange()), this.getStandardizeParams());
  }

  private getFirstFreeItemIndex(startIndex?: number): number {
    let result: number;

    const start = startIndex ?? this.min;
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
