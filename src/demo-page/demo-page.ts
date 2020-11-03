import '../plugin/liquidSlider';
import './demo-page.scss';

import '../view/slider/SliderView.scss';
import SliderPanel from '../blocks/slider-panel/slider-panel';
import initSliderPanels from '../blocks/slider-panel/init';

function importContext(r: __WebpackModuleApi.RequireContext): void { r.keys().forEach(r); }
importContext(require.context('../blocks', true, /\.(scss)$/));

const panels = initSliderPanels() as SliderPanel[];
panels.forEach((panel) => { panel.initSlider(); });
