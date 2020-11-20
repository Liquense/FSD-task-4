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
}

interface Orientable {
  getIsVertical(): boolean;
  getExpandDimension(): 'height' | 'width';
  getOffsetDirection(): 'top' | 'left';

  getOrientationClass(): string;
}

interface SliderContainer {
  getHandlersContainer(): HTMLElement;
  getBodyElement(): HTMLElement;
}

interface ScaleOwner {
  getScaleStart(): number;
  getScaleEnd(): number;
  getScaleBorderWidth(): number;
  calculateShrinkRatio(): number;
  getScaleLength(): number;
  getWorkZoneLength(): number;
}

interface HandlersOwner {
  getStepPart(): number;
  getHandlerSize(): number;
  calculateRelativeHandlerSize(): number;
}

export {
  SliderContainer, ScaleOwner, HandlersOwner, Orientable, View,
};
