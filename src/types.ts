type KeyStringObj = { [key: string]: any };

type Presentable = { toString(): string } | string;

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

export { Presentable, SliderPluginParams, KeyStringObj };
