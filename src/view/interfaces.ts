import { HandlerModelData, PositioningParams } from '../model/types';

import { SliderViewData, SliderViewParams } from './types';

interface View {
  getBody(): HTMLElement;

  getViewData(): SliderViewData;

  updateVisuals(parameters?: SliderViewParams): void;

  updateData(sliderData: PositioningParams): void;

  handleHandlerPositionChanged(
    handlerIndex: number,
    standardizedPosition: number,
  ): { view: View; handlerIndex: number; positionPart: number };

  handlerValueChangedListener(data: HandlerModelData): void;

  initHandlers(
    handlersData: { isCustomHandlers: boolean; handlersArray: HandlerModelData[] }
  ): void;

  addHandler(handlerData: HandlerModelData): void;

  removeHandler(handlerIndex: number): void;
}

interface Orientable {
  getIsVertical(): boolean;
  getExpandDimension(): string;
  getOffsetDirection(): string;

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
  calculateHandlerOffset(relativePosition: number): number;
}

interface SliderElement {
  getOwnerSlider(): Slider;
}

type Slider = Orientable & SliderContainer & ScaleOwner & HandlersOwner;

export {
  SliderContainer, ScaleOwner, HandlersOwner, SliderElement, Orientable, View, Slider,
};
