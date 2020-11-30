import { HandlerData } from '../types';
import { SliderVisualParams } from '../model/types';

type SliderViewUpdateParams = SliderVisualParams & {
  min?: number; max?: number; stepPart?: number;
};

type HandlerViewParams = HandlerData & {
  isTooltipVisible?: boolean; rangePair?: HandlerPair;
}

type HandlersViewData = { isCustomHandlers: boolean; handlersArray: HandlerViewParams[] };

type HandlerPositionData = { handlerIndex: number; position: number };

type HandlerPair = number | 'start' | 'end';

type OffsetDirection = 'top' | 'left';

type ExpandDimension = 'height' | 'width';

type SliderViewData = {
  stepPart: number; relativeHandlerSize: number;
  offsetDirection: OffsetDirection; expandDimension: ExpandDimension; isVertical: boolean;
}

export {
  SliderViewUpdateParams, HandlerViewParams, HandlersViewData, HandlerPositionData, HandlerPair,
  OffsetDirection, ExpandDimension, SliderViewData,
};
