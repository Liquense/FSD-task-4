/* eslint-disable no-undef */
import '../liquidSlider';
import '../view/slider/sliderView.scss';
import SliderPanel from './sliderPanel';
import './index.scss';

const sliderInitSelector = '.js-init-slider-here';
const panelSelector = '.panel';
const panels: SliderPanel[] = [];

$(panelSelector).get().forEach((panelWrap) => {
  panels.push(new SliderPanel(panelWrap));
});

panels[0].initSlider($(sliderInitSelector), {
  min: -50,
  max: 20,
  step: 1,
  isVertical: true,
});

panels[1].initSlider($(sliderInitSelector), { isReversed: true });

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
  isReversed: false,
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
    showTooltips: false,
    withMarkup: true,
    isVertical: false,
  });
