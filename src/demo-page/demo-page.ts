import '../plugin/liquidSlider';
import './demo-page.scss';

import '../view/slider/SliderView.scss';
import SliderPanel from '../blocks/slider-panel/slider-panel';
import initSliderPanels from '../blocks/slider-panel/init';

function importContext(r: __WebpackModuleApi.RequireContext): void { r.keys().forEach(r); }
importContext(require.context('../blocks', true, /\.(scss)$/));

const panels = initSliderPanels() as SliderPanel[];

panels[0].initSlider({
  min: -50,
  max: 20,
  step: 1,
  isVertical: true,
});

panels[1].initSlider({ isInverted: true });

panels[2].initSlider({
  items: [
    1,
    { toString(): string { return 'two'; } },
    "<img src='https://img.icons8.com/cotton/2x/like--v1.png' alt='heart'>",
    'last',
  ],
  min: 0,
  max: 22,
  isRange: true,
  isInverted: false,
  isVertical: true,
  withMarkup: true,
});

panels[3].initSlider({
  handlers: [
    { itemIndex: 2, rangePair: 'start' as const },
    { itemIndex: 4, rangePair: 0 },
    { itemIndex: 6, rangePair: 3 },
    { itemIndex: 7 },
  ],
  step: 2,
  isTooltipsVisible: false,
  withMarkup: true,
  isVertical: false,
});
