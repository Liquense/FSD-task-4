import bind from 'bind-decorator';
import { Presentable } from '../utils/types';
import { standardize } from '../utils/functions';
import { HandlerPluginParams, SliderPluginParams } from '../plugin/types';

import {
  HandlerModelData,
  HandlersModelData,
  PositioningData, SliderData,
  SliderModelParams, SliderParams,
} from './types';

import HandlerModel from './handler/HandlerModel';
import { Observer } from '../utils/Observer/Observer';
import { Observable } from '../utils/Observer/interfaces';
import { HandlerPositionData } from '../view/types';

class SliderModel implements Observable {
  public observers: { [key: string]: Observer } = {};

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
      isInverted: this.isInverted,
    };
  }

  public getHandlersData(): HandlersModelData {
    return {
      isCustomHandlers: this.isHandlersCustom,
      handlersArray: this.handlers.map(
        (handler) => ({
          handlerIndex: handler.handlerIndex,
          item: this.getItem(handler.getItemIndex()),
          positionPart: handler.getPosition(),
          itemIndex: handler.getItemIndex(),
        }),
      ),
    };
  }

  public getPositioningData(): PositioningData {
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
    if (!newHandler) {
      return null;
    }

    this.handlers.push(newHandler);
    newHandler.handlerIndex = newHandlerIndex;
    this.isHandlersCustom = true;

    return {
      positionPart: newHandler.getPosition(),
      item: this.getItem(newHandler.getItemIndex()),
      handlerIndex: newHandler.handlerIndex,
      itemIndex: newHandler.getItemIndex(),
    };
  }

  public removeHandler(handlerIndex: number): number {
    const handlerToRemoveIndex = this.handlers.findIndex(
      (handler) => handler.handlerIndex === handlerIndex,
    );
    if (handlerToRemoveIndex < 0) {
      return null;
    }

    this.releaseItem(this.handlers[handlerToRemoveIndex].getItemIndex());
    this.handlers.splice(handlerToRemoveIndex, 1);

    if (this.observers.removeHandler) {
      this.observers.removeHandler.callListeners(handlerIndex);
    }
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

  public addHandlerValueChangedListener(observer: Function): void {
    if (!this.observers.handleHandlerValueChanged) {
      this.observers.handleHandlerValueChanged = new Observer();
    }

    this.observers.handleHandlerValueChanged.addListener(observer);
  }

  public addRemoveHandlerListener(observer: Function): void {
    if (!this.observers.removeHandler) {
      this.observers.removeHandler = new Observer();
    }

    this.observers.removeHandler.addListener(observer);
  }

  @bind
  public handleHandlerValueChanged(
    changedHandler: HandlerModel,
  ): HandlerModelData {
    const changedHandlerIndex = this.handlers.findIndex(
      (handler) => handler.handlerIndex === changedHandler.handlerIndex,
    );

    if (changedHandlerIndex === -1) {
      return null;
    }

    const result = {
      handlerIndex: changedHandler.handlerIndex,
      positionPart: changedHandler.getPosition(),
      item: this.getItem(changedHandler.getItemIndex()),
      itemIndex: changedHandler.getItemIndex(),
    };

    if (this.observers.handleHandlerValueChanged) {
      this.observers.handleHandlerValueChanged.callListeners(result);
    }
    return result;
  }

  public handleHandlerPositionChanged(data: HandlerPositionData): void {
    const newPositionIndex = this.getItemIndexFromPosition(data.position);
    const movingHandlerIndex = this.handlers.findIndex(
      (handler) => handler.handlerIndex === data.handlerIndex,
    );
    this.setHandlerItemIndex(movingHandlerIndex, newPositionIndex);
  }

  public setHandlerItem(handlerIndex: number, item: Presentable): void {
    const foundItemIndex = this.getItemIndex(item);
    const isItemFree = !this.isItemOccupied(foundItemIndex);
    const validItemIndex = isItemFree
      ? standardize(foundItemIndex, this.getStandardizeParams())
      : null;

    if (validItemIndex === null) {
      this.handlers[handlerIndex].updatePosition(this.getSliderData());
      return;
    }

    this.setHandlerItemIndex(handlerIndex, validItemIndex);
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

  private setHandlerItemIndex(handlerIndex: number, itemIndex: number): void {
    const handler = this.handlers[handlerIndex];
    const oldItemIndex = handler.getItemIndex();

    if (this.isItemOccupied(itemIndex)) {
      handler.updatePosition(this.getSliderData());
      return;
    }

    handler.setItemIndex(itemIndex, this.getSliderData());
    this.releaseItem(oldItemIndex);
    this.occupyItem(itemIndex, handlerIndex);
  }

  private initHandlers(isRange: boolean, values: number[], handlers: HandlerPluginParams[]): void {
    if (handlers?.length) {
      this.isHandlersCustom = true;
      const handlersItemIndexes = handlers.map((handler) => handler.itemIndex);
      this.createHandlers(handlersItemIndexes);
    } else {
      const handlersCount = isRange ? 2 : 1;
      this.isHandlersCustom = false;
      this.initDefaultHandlersData(handlersCount, values);
    }
  }

  private updateHandlersPosition(): void {
    this.handlers.forEach((handler) => {
      const standardItemIndex = standardize(handler.getItemIndex(), this.getStandardizeParams());
      if (standardItemIndex === handler.getItemIndex()) {
        handler.updatePosition(this.getSliderData());
        return;
      }

      const newItemIndex = this.getFirstFreeItemIndex(handler.getItemIndex());
      if (newItemIndex === null) { this.removeHandler(handler.handlerIndex); }

      this.setHandlerItemIndex(
        handler.handlerIndex,
        standardize(newItemIndex, this.getStandardizeParams()),
      );
    });
  }

  private initDefaultHandlersData(handlersCount: number, itemIndexes?: number[]): void {
    this.handlers = [];
    const part = this.getRange() / (handlersCount + 1);
    const handlersItemIndexes = new Array(handlersCount).fill(null);
    handlersItemIndexes.forEach((_, index) => {
      if (Number.isFinite(itemIndexes?.[index])) {
        handlersItemIndexes[index] = standardize(itemIndexes[index], this.getStandardizeParams());
      } else {
        handlersItemIndexes[index] = standardize(
          this.min + ((index + 1) * part), this.getStandardizeParams(),
        );
      }
    });

    this.createHandlers(handlersItemIndexes);
  }

  private setStep(step: number): void {
    if (!step) {
      return;
    }

    this.step = this.isItemsCustom ? Math.round(step) : step;
    this.updateHandlersPosition();
  }

  private setMin(min: number): void {
    if (min === null || min === undefined) {
      return;
    }
    if (min > this.max) {
      return;
    }

    this.min = min;
    this.updateHandlersPosition();
  }

  private setMax(max: number): void {
    if (max === null || max === undefined) {
      return;
    }
    if (max < this.min) {
      return;
    }

    this.max = max;
    this.updateHandlersPosition();
  }

  private setMinMax(min: number, max: number): void {
    if (Number.isFinite(min) && Number.isFinite(max)) {
      if (min > max) {
        return;
      }
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

  private createHandlers(handlersItemIndexes: number[]): void {
    if (!handlersItemIndexes?.length) {
      return;
    }

    this.occupiedItems = [];
    this.handlers = [];
    const reducer = (
      newHandlers: HandlerModel[], handler: number,
    ): HandlerModel[] => {
      const itemIndex = standardize(handler, this.getStandardizeParams());
      const newHandlerIndex = newHandlers.length;
      const newHandler = this.createHandler(itemIndex, newHandlerIndex);
      if (newHandler !== null) {
        newHandlers.push(newHandler);
      }

      return newHandlers;
    };

    this.handlers = handlersItemIndexes.reduce(reducer, []);
  }

  private createHandler(itemIndex: number, handlerIndex: number): HandlerModel {
    const freeItemIndex = this.getFirstFreeItemIndex(itemIndex);
    if (freeItemIndex === null) {
      return null;
    }

    const newHandler = new HandlerModel(handlerIndex, freeItemIndex, this.getSliderData());
    newHandler.addUpdatePositionListener(this.handleHandlerValueChanged);

    this.occupyItem(freeItemIndex, handlerIndex);
    return newHandler;
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
    const standardStart = standardize(start, this.getStandardizeParams());
    const standardEnd = standardize(end, this.getStandardizeParams());
    const indexesAmount = Math.floor((standardEnd - standardStart) / this.step) + 1;

    const indexesArray = new Array(indexesAmount)
      .fill(null)
      .map((_, index) => standardStart + (index * this.step));
    const result = indexesArray.find((index) => !this.isItemOccupied(index));
    return result ?? null;
  }

  private getItemIndex(itemToFind: Presentable): number {
    if (this.isItemsCustom) {
      return this.items.findIndex((item) => item.toString() === itemToFind.toString());
    }

    const parsedItem = Number.parseFloat(itemToFind.toString());
    if (Number.isNaN(parsedItem)) {
      return null;
    }

    return parsedItem;
  }
}

export default SliderModel;
