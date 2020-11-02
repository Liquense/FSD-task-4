import { HandlerData } from '../types';

type SliderModelParams = {
  min?: number;
  max?: number;
  step?: number;
};

type SliderModelData = {
  min?: number;
  max?: number;
  step?: number;
  range?: number;
};

type HandlerModelData = HandlerData & { itemIndex: number };

type HandlersModelData = { isCustomHandlers: boolean; handlersArray: HandlerModelData[] };

type PositioningParams = { min: number; max: number; stepPart: number };

export {
  SliderModelParams, HandlerModelData, PositioningParams, HandlersModelData, SliderModelData,
};
