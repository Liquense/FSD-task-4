import { HandlerData } from '../types';

type SliderParams = SliderModelParams & SliderVisualParams;

type SliderModelParams = {
  min?: number;
  max?: number;
  step?: number;
};

type SliderVisualParams = {
  isVertical?: boolean;
  isTooltipsVisible?: boolean;
  isInverted?: boolean;
  isMarkupVisible?: boolean;
}

type SliderData = SliderModelData & SliderVisualData;

type SliderModelData = {
  min: number;
  max: number;
  step: number;
  range: number;
};

type SliderVisualData = {
  isVertical: boolean;
  isTooltipsVisible: boolean;
  isMarkupVisible: boolean;
  isInverted: boolean;
}

type HandlerModelData = HandlerData & { itemIndex: number };

type HandlersModelData = { isCustomHandlers: boolean; handlersArray: HandlerModelData[] };

type PositioningParams = { min: number; max: number; stepPart: number };

export {
  SliderModelParams, HandlerModelData, PositioningParams, HandlersModelData, SliderModelData,
  SliderVisualData, SliderVisualParams, SliderParams, SliderData,
};
