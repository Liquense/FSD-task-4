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

const slider = $(sliderInitSelector).liquidSlider({
  min: -50,
  max: 20,
  step: 1,
  isVertical: true,
});
slider.addView(panels[0]);
panels[0].boundController = slider;

const slider2 = $(sliderInitSelector).liquidSlider({ isReversed: true });
slider2.addView(panels[1]);
panels[1].boundController = slider2;

const slider3 = $(sliderInitSelector).liquidSlider({
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
slider3.addView(panels[2]);
panels[2].boundController = slider3;

const slider4 = $(sliderInitSelector).liquidSlider({
  handlers: [
    { rangePair: 'start' },
    { itemIndex: 2, rangePair: 0 },
    { itemIndex: 3, rangePair: 3 },
    { itemIndex: 6 },
  ],
  showTooltips: false,
  withMarkup: true,
  isVertical: false,
});
slider4.addView(panels[3]);
panels[3].boundController = slider4;
