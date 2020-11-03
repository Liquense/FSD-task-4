import SliderPanel from './slider-panel';
import { initBlocks } from '../../utils/functions';

function initSliderPanels(parentElement?: JQuery | HTMLElement): SliderPanel | SliderPanel[] {
  return initBlocks(parentElement, `.js-${SliderPanel.DEFAULT_CLASS}`, SliderPanel) as SliderPanel[];
}

export default initSliderPanels;
