import { SliderModelParams } from '../model/types';
import { SliderViewParams } from '../view/types';
import { Presentable } from '../utils/types';

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

type PluginUpdateParams = (SliderModelParams & SliderViewParams) | HandlerPluginParams | Function;

export { PluginUpdateParams, SliderPluginParams, HandlerPluginParams };
