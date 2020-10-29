type KeyStringObj = { [key: string]: any };

type Presentable = { toString(): string } | string;

type HandlerData = { handlerIndex: number; positionPart: number; item: Presentable }

type HandlerPluginParams = { itemIndex: number; rangePair?: number | 'start' | 'end' }

type SliderPluginParams = {
  min?: number;
  max?: number;
  step?: number;
  items?: Presentable[];
  values?: number[];
  isRange?: boolean;
  isVertical?: boolean;
  isInverted?: boolean;
  isTooltipsVisible?: boolean;
  withMarkup?: boolean;
  handlers?: HandlerPluginParams[];
};

export {
  Presentable, SliderPluginParams, KeyStringObj, HandlerPluginParams, HandlerData,
};
