/* eslint-disable no-undef */
import '../plugin/liquidSlider';
import '../view/slider/SliderView.scss';
import SliderPanel from './slider-panel/slider-panel';

function importContext(r: __WebpackModuleApi.RequireContext): void { r.keys().forEach(r); }
importContext(require.context('./', true, /\.(scss)$/));

const sliderInitSelector = '.js-slider-panel__slider';
const panelSelector = '.slider-panel';
const panels: SliderPanel[] = [];

$(panelSelector).get().forEach((panel) => {
  panels.push(new SliderPanel(panel));
});

panels[0].initSlider($(sliderInitSelector), {
  min: -50,
  max: 20,
  step: 1,
  isVertical: true,
});

panels[1].initSlider($(sliderInitSelector), { isInverted: true });

panels[2].initSlider($(sliderInitSelector), {
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

panels[3].initSlider($(sliderInitSelector),
  {
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
