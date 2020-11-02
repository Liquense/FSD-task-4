import { Presentable } from '../utils/types';
import { SliderModelData, SliderModelParams } from './types';

interface Handler {
  handlerIndex: number;

  getPosition(): number;
  getItem(): Presentable;
}

interface SliderDataContainer {
  setSliderParams(params: SliderModelParams): void;
  getSliderData(): SliderModelData;
}

interface ModelItemManager {
  releaseItem(itemIndex: number): void;
  occupyItem(itemIndex: number, handlerIndex: number): void;
  checkItemOccupancy(itemIndex: number): boolean;
  getItem(itemIndex: number): Presentable;
  handlerValueChanged(handler: Handler): void;
}

export {
  Handler, SliderDataContainer, ModelItemManager,
};
