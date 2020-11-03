import { initBlocks } from '../../utils/functions';
import { SliderPluginParams } from '../../plugin/types';

import Slider from './slider';

function initSliders(
  parentElement: JQuery | HTMLElement, sliderParams?: SliderPluginParams,
): Slider[] {
  return initBlocks(parentElement, `.js-${Slider.DEFAULT_CLASS}`, Slider, sliderParams) as Slider[];
}

export default initSliders;
