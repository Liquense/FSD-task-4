import { importContext } from '../utils/functions';
import '../favicons/favicons';
import '../plugin/liquidSlider';
import '../view/SliderView.scss';
import './demo-page.scss';

import initSliderPanels from '../blocks/slider-panel/init';

importContext(require.context('../blocks', true, /\.(scss)$/));

const panels = initSliderPanels();
panels.forEach((panel) => {
  panel.initSlider();
});
