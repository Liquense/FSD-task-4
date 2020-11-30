import { SliderModelParams, SliderVisualParams } from '../model/types';
import { Presentable } from '../utils/types';

type HandlerPluginParams = { itemIndex: number; rangePair?: number | 'start' | 'end' }

type SliderPluginParams = SliderModelParams & SliderVisualParams & {
  items?: Presentable[];
  values?: number[];
  isRange?: boolean;
  handlers?: HandlerPluginParams[];
};

type PluginUpdateParams = SliderModelParams | HandlerPluginParams | Function;

export { PluginUpdateParams, SliderPluginParams, HandlerPluginParams };
