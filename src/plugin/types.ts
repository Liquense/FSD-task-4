import { SliderModelParams } from '../model/types';
import { SliderViewParams } from '../view/types';
import { HandlerPluginParams } from '../types';

type PluginUpdateParams = (SliderModelParams & SliderViewParams) | HandlerPluginParams | Function;

export { PluginUpdateParams };
