import { HandlerModelData, PositioningParams, SliderModelParams } from '../model/types';
import { HandlerPositionData } from './types';

interface View {
  getBody(): HTMLElement;

  updateVisuals(parameters?: SliderModelParams): void;

  updatePositioning(positioningData: PositioningParams): void;

  handleHandlerPositionChanged({ handlerIndex, position }: HandlerPositionData): {
    handlerIndex: number; positionPart: number;
  };

  handlerValueChangedListener(data: HandlerModelData): void;

  initHandlers(
    handlersData: { isCustomHandlers: boolean; handlersArray: HandlerModelData[] }
  ): void;

  addHandler(handlerData: HandlerModelData): void;

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
}

interface HandlersOwner {
  getStepPart(): number;
  calculateRelativeHandlerSize(): number;
  calculateHandlerOffset(relativePosition: number): number;
}

interface SliderElement {
  getOwnerSlider(): Slider;
}

type Slider = Orientable & SliderContainer & ScaleOwner & HandlersOwner;

export {
  SliderContainer, ScaleOwner, HandlersOwner, SliderElement, Orientable, View, Slider,
};
