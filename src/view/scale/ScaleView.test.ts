/* eslint-disable dot-notation */
import { DEFAULT_SLIDER_PARAMS } from '../../constants';

import SliderView from '../SliderView';
import ScaleView from './ScaleView';

jest.mock('../SliderView');

const sliderBody = document.createElement('div');
document.body.append(sliderBody);
const defaultParams = { ...DEFAULT_SLIDER_PARAMS, ...{ range: 10, stepPart: 0.1 } };
const mockSlider = new SliderView(sliderBody, defaultParams);

const scaleBody = document.createElement('div');
sliderBody.append(scaleBody);
const testScale = new ScaleView(mockSlider, scaleBody);
scaleBody.getBoundingClientRect = jest.fn(() => ({
  height: 10, width: 6, bottom: 21, left: 0, right: 6, top: 11, x: 0, y: 0, toJSON: null,
}));

function setMockSliderIsVertical(isVertical: boolean): void {
  mockSlider.getIsVertical = jest.fn(() => isVertical);
  mockSlider.getExpandDimension = jest.fn(() => (isVertical ? 'height' : 'width'));
  mockSlider.getOffsetDirection = jest.fn(() => (isVertical ? 'top' : 'left'));
}

describe('Получение данных шкалы', () => {
  test('Получение начала шкалы', () => {
    setMockSliderIsVertical(false);
    expect(testScale.getStart()).toBe(0);

    setMockSliderIsVertical(true);
    expect(testScale.getStart()).toBe(11);
  });

  test('Получение окончания шкалы', () => {
    setMockSliderIsVertical(false);
    expect(testScale.getEnd()).toBe(6);

    setMockSliderIsVertical(true);
    expect(testScale.getEnd()).toBe(21);
  });

  test('Получение толщины границы', () => {
    setMockSliderIsVertical(true);
    testScale['bodyElement'].style.borderWidth = '2px';

    expect(testScale.getBorderWidth()).toBe(2);
  });

  test('Получение длины шкалы', () => {
    setMockSliderIsVertical(false);
    expect(testScale.getLength()).toBe(6);

    setMockSliderIsVertical(true);
    expect(testScale.getLength()).toBe(10);
  });
});

test('Получение нормализованного положения мыши относительно шкалы', () => {
  const testClickEvent = new MouseEvent('click', { clientX: 3, clientY: 16 });
  mockSlider.getHandlerSize = jest.fn(() => 2);

  setMockSliderIsVertical(false);
  expect(testScale.calculateMouseRelativePosition(testClickEvent)).toBe(0.5);

  setMockSliderIsVertical(true);
  expect(testScale.calculateMouseRelativePosition(testClickEvent)).toBe(0.5);
});
