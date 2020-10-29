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

type HandlerModelParams = HandlerData & { itemIndex: number };

type HandlersModelData = { isCustomHandlers: boolean; handlersArray: HandlerModelParams[] };

type PositioningParams = { min: number; max: number; stepPart: number };

export {
  SliderModelParams, HandlerModelParams, PositioningParams, HandlersModelData, SliderModelData,
};
