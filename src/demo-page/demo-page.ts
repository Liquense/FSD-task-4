import '../plugin/liquidSlider';
import './demo-page.scss';

import '../view/SliderView.scss';
import initSliderPanels from '../blocks/slider-panel/init';

function importContext(r: __WebpackModuleApi.RequireContext): void { r.keys().forEach(r); }
importContext(require.context('../blocks', true, /\.(scss)$/));

const panels = initSliderPanels();
panels.forEach((panel) => {
  panel.initSlider();
});
