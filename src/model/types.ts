import { HandlerParams, Presentable } from '../types';

type SliderModelParams = {
  isRange?: boolean;
  min?: number;
  max?: number;
  step?: number;
  items?: Array<Presentable>;
  values?: number[];
  handlers?: {
    itemIndex: number;
  }[];
};

type HandlerModelParams = HandlerParams & { itemIndex: number };

type PositioningParams = { min: number; max: number; step: number };

export {
  SliderModelParams, HandlerModelParams, PositioningParams,
};
