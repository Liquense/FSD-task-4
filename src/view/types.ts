import { Presentable } from '../types';

type SliderViewUpdateParams = {
  min?: number; max?: number; step?: number;
  isVertical?: boolean; tooltipsVisible?: boolean; withMarkup?: boolean;
}

type SliderViewParams = {
  isVertical?: boolean;
  showTooltips?: boolean;
  isReversed?: boolean;
  withMarkup?: boolean;
}

type HandlerViewParams = {
  handlerIndex: number;
  positionPart: number;
  item: Presentable;
  withTooltip?: boolean;
  rangePair?: number | string;
}

export {
  SliderViewUpdateParams, SliderViewParams, HandlerViewParams,
};
