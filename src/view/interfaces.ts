import { HandlerModelParams, PositioningParams } from '../model/types';

import { SliderViewParams } from './types';

interface View {
  getBody(): HTMLElement;

  getViewData(): SliderViewParams;

  updateVisuals(parameters?: SliderViewParams): void;

  updateData(sliderData: PositioningParams): void;

  handleHandlerPositionChanged(
    handlerIndex: number,
    standardizedPosition: number,
  ): { view: View; handlerIndex: number; positionPart: number };

  handlerValueChangedListener(data: HandlerModelParams): void;

  initHandlers(
    handlersData: { customHandlers: boolean; handlersArray: HandlerModelParams[] }
  ): void;

  addHandler(handlerData: HandlerModelParams): void;

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
