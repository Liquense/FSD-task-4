import { Listenable } from '../utils/interfaces';
import { Presentable } from '../utils/types';
import { standardize } from '../utils/functions';
import { HandlerPluginParams, SliderPluginParams } from '../plugin/types';

import {
  HandlerModelData,
  HandlersModelData,
  PositioningParams, SliderData,
  SliderModelParams, SliderParams,
} from './types';

import { ModelItemManager, SliderDataContainer } from './interfaces';
import HandlerModel from './handler/HandlerModel';

class SliderModel implements Listenable, SliderDataContainer, ModelItemManager {
  public listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

  private items: Array<Presentable>;

  private occupiedItems: { [key: number]: number } = {};

  private isVertical: boolean;

  private isMarkupVisible: boolean;

  private isTooltipsVisible: boolean;

  private isInverted: boolean;

  private min: number;

  private max: number;

  private step: number;

  private handlers: HandlerModel[] = [];

  private isHandlersCustom: boolean;

  private isItemsCustom: boolean;

  constructor(
    {
      isRange, min, max, step, items, values, handlers,
      isTooltipsVisible, isMarkupVisible, isVertical, isInverted,
    }: SliderPluginParams = {},
  ) {
    this.setSliderParams({
      min, max, step, isMarkupVisible, isTooltipsVisible, isVertical, isInverted,
    });
    this.setItems(items);
    this.initHandlers(isRange, values, handlers);
  }

  public setSliderParams(
    {
      min, max, step,
      isVertical = this.isVertical,
      isTooltipsVisible = this.isTooltipsVisible,
      isMarkupVisible = this.isMarkupVisible,
      isInverted = this.isInverted,
    }: SliderParams,
  ): void {
    this.setMinMax(min, max);
    this.setStep(step);
    this.isVertical = isVertical;
    this.isTooltipsVisible = isTooltipsVisible;
    this.isMarkupVisible = isMarkupVisible;
    this.isInverted = isInverted;
  }

  public getSliderData(): SliderData {
    return {
      min: this.min,
      max: this.max,
      step: this.step,
      range: this.getRange(),
      isTooltipsVisible: this.isTooltipsVisible,
      isVertical: this.isVertical,
      isMarkupVisible: this.isMarkupVisible,
    };
  }

  public getHandlersData(): HandlersModelData {
    return {
      isCustomHandlers: this.isHandlersCustom,
      handlersArray: this.handlers.map(
        (handler) => ({
          handlerIndex: handler.handlerIndex,
          item: handler.getItem(),
          positionPart: handler.getPosition(),
          itemIndex: handler.getItemIndex(),
        }),
      ),
    };
  }

  public getPositioningData(): PositioningParams {
    return {
      stepPart: this.step / this.getRange(),
      min: this.min,
      max: this.max,
    };
  }

  public addHandler(itemIndex: number): HandlerModelData {
    const indexes = this.handlers.map((handler) => handler.handlerIndex);
    const newHandlerIndex = Math.max(-1, ...indexes) + 1;

    const newHandler = this.createHandler(itemIndex, newHandlerIndex);
    if (!newHandler) { return null; }

    this.handlers.push(newHandler);
    newHandler.handlerIndex = newHandlerIndex;
    this.isHandlersCustom = true;

    return {
      positionPart: newHandler.getPosition(),
      item: newHandler.getItem(),
      handlerIndex: newHandler.handlerIndex,
      itemIndex: newHandler.getItemIndex(),
    };
  }

  public removeHandler(handlerIndex: number): number {
    const handlerToRemoveIndex = this.handlers.findIndex(
      (handler) => handler.handlerIndex === handlerIndex,
    );
    if (handlerToRemoveIndex < 0) { return null; }

    this.releaseItem(this.handlers[handlerToRemoveIndex].getItemIndex());
    this.handlers.splice(handlerToRemoveIndex, 1);
    return handlerIndex;
  }

  public getItem(valueOrIndex: number): Presentable {
    return this.items?.length ? this.items[valueOrIndex] : valueOrIndex;
  }

  public getRange(): number {
    return this.max - this.min;
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

  public handleHandlerValueChanged(
    changedHandler: HandlerModel,
  ): HandlerModelData {
    const changedHandlerIndex = this.handlers.findIndex(
      (handler) => handler.handlerIndex === changedHandler.handlerIndex,
    );

    if (changedHandlerIndex === -1) { return null; }

    return {
      handlerIndex: changedHandler.handlerIndex,
      positionPart: changedHandler.getPosition(),
      item: changedHandler.getItem(),
      itemIndex: changedHandler.getItemIndex(),
    };
  }

  public handleHandlerPositionChanged(data: { handlerIndex: number; positionPart: number }): void {
    const newStandardPosition = this.getItemIndexFromPosition(data.positionPart);

    const movingHandlerIndex = this.handlers.findIndex(
      (handler) => handler.handlerIndex === data.handlerIndex,
    );
    this.handlers[movingHandlerIndex].setItemIndex(newStandardPosition);
  }

  public setHandlerItem(handlerIndex: number, item: Presentable): void {
    const foundIndex = this.getItemIndex(item);

    let validIndex: number;
    if (!this.isItemOccupied(foundIndex)) {
      validIndex = standardize(foundIndex, this.getStandardizeParams());
    }
    if (Number.isNaN(validIndex)) { return; }

    this.handlers[handlerIndex].setItemIndex(validIndex);
  }

  public isItemOccupied(itemIndex: number): boolean {
    return !(this.occupiedItems[itemIndex] === undefined);
  }

  public occupyItem(itemIndex: number, handlerIndex: number): void {
    this.occupiedItems[itemIndex] = handlerIndex;
  }

  public releaseItem(itemIndex: number): void {
    delete this.occupiedItems[itemIndex];
  }

  private initHandlers(isRange: boolean, values: number[], handlers: HandlerPluginParams[]): void {
    if (handlers?.length) {
      this.isHandlersCustom = true;
      this.createHandlers(handlers);
    } else {
      const handlersNumber = isRange ? 2 : 1;
      this.isHandlersCustom = false;
      this.initDefaultHandlers(handlersNumber, values);
    }
  }

  private updateHandlersPosition(): void {
    this.handlers.forEach((handler) => {
      const standardItemIndex = standardize(handler.getItemIndex(), this.getStandardizeParams());
      if (standardItemIndex === handler.getItemIndex()) {
        handler.setItemIndex(standardize(standardItemIndex, this.getStandardizeParams()));
        return;
      }

      const newItemIndex = this.getFirstFreeItemIndex(handler.getItemIndex());
      if (newItemIndex === null) { this.removeHandler(handler.handlerIndex); }

      handler.setItemIndex(standardize(newItemIndex, this.getStandardizeParams()));
    });
  }

  private initDefaultHandlers(handlersCount: number, itemIndexes?: number[]): void {
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

  private setStep(step: number): void {
    if (!step) { return; }

    this.step = this.isItemsCustom ? Math.round(step) : step;
    this.updateHandlersPosition();
  }

  private setMin(min: number): void {
    if (min === null || min === undefined) { return; }
    if (min > this.max) { return; }

    this.min = min;
    this.updateHandlersPosition();
  }

  private setMax(max: number): void {
    if (max === null || max === undefined) { return; }
    if (max < this.min) { return; }

    this.max = max;
    this.updateHandlersPosition();
  }

  private setMinMax(min: number, max: number): void {
    if (Number.isFinite(min) && Number.isFinite(max)) {
      if (min > max) { return; }
      this.min = min;
      this.max = max;
    } else {
      this.setMin(min);
      this.setMax(max);
    }
  }

  private getStandardizeParams(): SliderModelParams {
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

    const handlerValue = this.getItem(freeItemIndex);

    return new HandlerModel(handlerValue, freeItemIndex, this, handlerIndex);
  }

  private getItemIndexFromPosition(position: number): number {
    return (position === 1)
      ? this.max
      : standardize((this.min + position * this.getRange()), this.getStandardizeParams());
  }

  private getFirstFreeItemIndex(startIndex?: number): number {
    let result: number;

    const start = standardize(startIndex, this.getStandardizeParams()) ?? this.min;
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
      if (!this.isItemOccupied(i)) {
        result = i;
        break;
      }
    }

    return result;
  }

  private getItemIndex(itemToFind: Presentable): number {
    if (this.isItemsCustom) {
      return this.items.findIndex((item) => item.toString() === itemToFind.toString());
    }

    const parsedItem = Number.parseFloat(itemToFind.toString());
    if (Number.isNaN(parsedItem)) { return null; }

    return parsedItem;
  }
}

export default SliderModel;
