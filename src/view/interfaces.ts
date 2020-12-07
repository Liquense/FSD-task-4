import { HandlerModelData } from '../model/types';
import { HandlerPositionData, HandlerViewParams, SliderViewUpdateParams } from './types';

interface View {
  update(parameters?: SliderViewUpdateParams): void;

  handleHandlerPositionChanged(handlerPositionData: HandlerPositionData): void;

  setHandlersData(handlers: HandlerModelData[]): void;

  initHandlers(
    handlersData: { isCustomHandlers: boolean; handlersArray: HandlerModelData[] }
  ): void;

  addHandler(handlerData: HandlerViewParams): void;

  removeHandler(handlerIndex: number): void;

  addHandlerPositionChangedListener(observer: Function): void;
}

export { View };
