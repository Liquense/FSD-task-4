const DEFAULT_SLIDER_PARAMS = {
  isVertical: false,
  isTooltipsVisible: true,
  isMarkupVisible: false,
  isInverted: false,
  min: 0,
  max: 10,
  step: 1,
};
const DEFAULT_SLIDER_CLASS = 'liquid-slider';
const RANGE_PAIR_OPTIONS = new Map()
  .set(null, null)
  .set('start', false)
  .set('end', true);
const RANGE_PAIR_START_KEY = 'start';
const RANGE_PAIR_END_KEY = 'end';

export {
  DEFAULT_SLIDER_CLASS, DEFAULT_SLIDER_PARAMS, RANGE_PAIR_OPTIONS,
  RANGE_PAIR_END_KEY, RANGE_PAIR_START_KEY,
};
