import { HandlerParams } from '../types';

type SliderViewUpdateParams = { min?: number; max?: number; step?: number } & SliderViewParams;

type SliderViewParams = {
  isVertical?: boolean;
  isTooltipsVisible?: boolean;
  isInverted?: boolean;
  withMarkup?: boolean;
}

type HandlerViewParams = HandlerParams & { isTooltipVisible?: boolean; rangePair?: number | string }

export {
  SliderViewUpdateParams, SliderViewParams, HandlerViewParams,
};
