import { HandlerData } from '../types';
import { SliderVisualParams } from '../model/types';

type SliderViewUpdateParams = { min?: number; max?: number; stepPart?: number }
& SliderVisualParams;

type HandlerViewParams = HandlerData & { isTooltipVisible?: boolean; rangePair?: number | string }

type HandlersViewData = { isCustomHandlers: boolean; handlersArray: HandlerViewParams[] };

type HandlerPositionData = { handlerIndex: number; position: number };

export {
  SliderViewUpdateParams, HandlerViewParams, HandlersViewData, HandlerPositionData,
};
