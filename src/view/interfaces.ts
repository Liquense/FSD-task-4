import { Presentable } from '../types';

interface View {
  getBody(): HTMLElement;

  updateVisuals(
    parameters?: { isVertical?: boolean; tooltipsVisible?: boolean; withMarkup?: boolean }
  ): void;

  updateData(
    sliderData: { step?: number; absoluteStep: number; min: number; max: number }
  ): void;

  handleHandlerPositionChanged(
    handlerIndex: number,
    standardizedPosition: number,
  ): { view: View; index: number; position: number };

  handlersValuesChangedListener(
    data: { index: number; relativeValue: number; item: Presentable }
  ): void;

  initHandlers(handlersData: {
    customHandlers: boolean;
    handlersArray: {
      handlerIndex: number;
      positionPart: number;
      item: Presentable;
      itemIndex: number;
    }[];
  }): void;

  addHandler(
    handlerParams: { positionPart: number; item: Presentable; handlerIndex: number }
  ): void;

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
