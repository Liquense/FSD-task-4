import { Presentable } from '../types';

interface Handler {
  handlerIndex: number;

  getPosition(): number;
  getItem(): Presentable;
}

interface SliderDataContainer {
  getMin(): number;
  getMax(): number;
  getStep(): number;
  getRange(): number;
}

interface ModelItemManager {
  releaseItem(itemIndex: number): void;
  occupyItem(itemIndex: number, handlerIndex: number): void;
  checkItemOccupancy(itemIndex: number): boolean;
  calculateValue(itemIndex: number): Presentable;
  handlerValueChanged(handler: Handler): void;
}

export {
  Handler, SliderDataContainer, ModelItemManager,
};
