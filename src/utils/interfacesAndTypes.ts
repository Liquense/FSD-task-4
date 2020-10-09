interface View {
    getBody(): HTMLElement;

    passVisualProps(
        parameters?: { isVertical?: boolean; tooltipsVisible?: boolean; withMarkup?: boolean }
    ): void;

    passDataProps(
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

type Slider = Orientable & SliderContainer & ScaleOwner & HandlersOwner;

interface SliderElement {
  getOwnerSlider(): Slider;
}

interface Listenable {
  listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };
}

type KeyStringObj = { [key: string]: any };
type Presentable = { toString(): string } | string;
type SliderModelParams = {
  isRange?: boolean;
  min?: number;
  max?: number;
  step?: number;
  items?: Array<Presentable>;
  values?: number[];
  handlers?: {
    itemIndex: number;
  }[];
};

export {
  View, Orientable, SliderContainer, ScaleOwner, HandlersOwner, SliderElement, Slider, Listenable,
  KeyStringObj, Presentable,
};
