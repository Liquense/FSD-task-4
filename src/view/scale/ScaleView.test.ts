/* eslint-disable dot-notation */
import ScaleView from './ScaleView';
import { SliderViewData } from '../types';

jest.mock('../SliderView');

const sliderBody = document.createElement('div');
document.body.append(sliderBody);

const scaleBody = document.createElement('div');
sliderBody.append(scaleBody);
const testScale = new ScaleView(scaleBody);
scaleBody.getBoundingClientRect = jest.fn(() => ({
  height: 10, width: 6, bottom: 21, left: 0, right: 6, top: 11, x: 0, y: 0, toJSON: null,
}));

describe('Получение данных шкалы', () => {
  test('Получение начала шкалы', () => {
    expect(testScale.getStart(false)).toBe(0);
    expect(testScale.getStart(true)).toBe(11);
  });

  test('Получение окончания шкалы', () => {
    expect(testScale.getEnd(false)).toBe(6);
    expect(testScale.getEnd(true)).toBe(21);
  });

  test('Получение толщины границы', () => {
    testScale['bodyElement'].style.borderWidth = '2px';

    expect(testScale.getBorderWidth('top')).toBe(2);
  });

  test('Получение длины шкалы', () => {
    expect(testScale.getLength('width')).toBe(6);
    expect(testScale.getLength('height')).toBe(10);
  });
});

test('Получение нормализованного положения мыши относительно шкалы', () => {
  const testClickEvent = new MouseEvent('click', { clientX: 3, clientY: 16 });
  const testSliderViewData: SliderViewData = {
    stepPart: 0.1,
    isVertical: false,
    expandDimension: 'width',
    offsetDirection: 'left',
    relativeHandlerSize: 0.2,
  };

  expect(testScale.calculateMouseRelativePosition(testClickEvent, testSliderViewData)).toBe(0.5);

  testSliderViewData.isVertical = true;
  testSliderViewData.expandDimension = 'height';
  testSliderViewData.offsetDirection = 'top';
  expect(testScale.calculateMouseRelativePosition(testClickEvent, testSliderViewData)).toBe(0.5);
});
