import { HandlerData } from '../types';

type SliderViewUpdateParams = { min?: number; max?: number; stepPart?: number } & SliderViewParams;

type SliderViewParams = {
  isVertical?: boolean;
  isTooltipsVisible?: boolean;
  isInverted?: boolean;
  withMarkup?: boolean;
}

type SliderViewData = {
  isVertical: boolean;
  isTooltipsVisible: boolean;
  isInverted: boolean;
  withMarkup: boolean;
}

type HandlerViewParams = HandlerData & { isTooltipVisible?: boolean; rangePair?: number | string }

type HandlersViewData = { isCustomHandlers: boolean; handlersArray: HandlerViewParams[] };

export {
  SliderViewUpdateParams, SliderViewParams, HandlerViewParams, SliderViewData, HandlersViewData,
};
