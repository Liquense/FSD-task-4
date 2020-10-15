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

interface Handler {
  handlerIndex: number;

  getPosition(): number;
  getItem(): Presentable;
}

interface SliderDataContainer {
  getMin(): number;
  getMax(): number;
  getRange(): number;
}

interface ModelItemManager {
  releaseItem(itemIndex: number): void;
  occupyItem(itemIndex: number, handlerIndex: number): void;
  checkItemOccupancy(itemIndex: number): boolean;
  calculateValue(itemIndex: number): Presentable;
  handlerValueChanged(handler: Handler): void;
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

type SliderViewUpdateParams = {
  min?: number; max?: number; step?: number;
  isVertical?: boolean; tooltipsVisible?: boolean; withMarkup?: boolean;
}

type SliderViewParams = {
  isVertical?: boolean;
  showTooltips?: boolean;
  isReversed?: boolean;
  withMarkup?: boolean;
}

type SliderPluginParams = {
  items?: Presentable[];
  values?: number[];
  isRange?: boolean;
  isVertical?: boolean;
  isReversed?: boolean;
  min?: number;
  max?: number;
  step?: number;
  showTooltips?: boolean;
  withMarkup?: boolean;
  handlers?: {
    itemIndex: number;
    additionalClasses?: string;
    rangePair?: number | 'start' | 'end';
    tooltip?: {
      additionalClasses?: string;
    };
  }[];
};

type HandlerViewParams = {
  handlerIndex: number;
  positionPart: number;
  item: Presentable;
  withTooltip?: boolean;
  rangePair?: number | string;
}

export {
  View, Orientable, SliderContainer, ScaleOwner, HandlersOwner, SliderElement, Slider, Listenable,
  KeyStringObj, Presentable, SliderModelParams, SliderPluginParams, SliderViewUpdateParams,
  SliderViewParams, HandlerViewParams, Handler, ModelItemManager, SliderDataContainer,
};
