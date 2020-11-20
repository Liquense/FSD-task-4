/* eslint-disable dot-notation,no-undef */
import { KeyStringObj } from '../../utils/types';

import MarkupView from './MarkupView';
import { MarkupParams } from './types';
import { OffsetDirection } from '../types';

jest.mock('../SliderView');

document.body.innerHTML = '<div class="liquidSlider liquidSlider_horizontal"></div>';
const testSliderContainer = document.querySelector('.liquidSlider') as HTMLElement;
const testHandlersContainer = document.createElement('div');
testSliderContainer.append(testHandlersContainer);

const defaultMarkupParams: MarkupParams = {
  relativeHandlerSize: 0.05,
  offsetDirection: 'left',
  expandDimension: 'width',
  isVertical: false,
  scaleLength: 100,
  shrinkRatio: 0.9,
  stepPart: 0.01,
};

let testMarkup: MarkupView & KeyStringObj;

describe('Инициализация экземпляра разметки', () => {
  test('Вызывается создание элемента', () => {
    const oldFunc = MarkupView.prototype['createWrap'];
    const mockFunc = jest.fn(() => undefined);

    MarkupView.prototype['createWrap'] = mockFunc;

    testMarkup = new MarkupView(testSliderContainer, testHandlersContainer);

    MarkupView.prototype['createWrap'] = oldFunc;
    expect(mockFunc.mock.calls.length).toBe(1);
  });
});

describe('Функционал разметки', () => {
  beforeAll(() => {
    testMarkup = new MarkupView(testSliderContainer, testHandlersContainer);
    testMarkup.getWrap().outerHTML = '';
  });

  test('Создание обертки на странице', () => {
    testMarkup['createWrap'](testSliderContainer, testHandlersContainer);
    expect(
      testSliderContainer.innerHTML.includes(testMarkup.getWrap().outerHTML),
    ).toBeTruthy();
  });

  test('Получение ширины метки', () => {
    testMarkup['addMark']({ ...defaultMarkupParams, ...{ relativePosition: 0.5 } });

    expect(testMarkup['getMarkThickness']('width'))
      .toBe((testMarkup['marks'][0].getBoundingClientRect() as KeyStringObj)['width']);
  });

  test('Получение относительной ширины метки', () => {
    testMarkup = new MarkupView(testSliderContainer, testHandlersContainer);
    testMarkup['getMarkThickness'] = jest.fn(() => 1);

    expect(testMarkup['getRelativeMarkThickness']({
      ...defaultMarkupParams,
      ...{ shrinkRatio: 1 },
    })).toBe(0.01);
  });

  describe('Добавление метки', () => {
    beforeEach(() => {
      testMarkup = new MarkupView(testSliderContainer, testHandlersContainer);
    });

    test('Добавление в массив меток', () => {
      const arrayLength = testMarkup['marks'].length;
      testMarkup['addMark']({ ...defaultMarkupParams, ...{ relativePosition: 0.5 } });
      expect(testMarkup['marks'].length).toBe(arrayLength + 1);
    });

    describe('Создание и размещение', () => {
      test('Правильный расчёт смещения', () => {
        testMarkup['addMark']({ ...defaultMarkupParams, ...{ relativePosition: 0.5 } });
        expect(testMarkup['marks'].pop().style.left).toBe('52.5%');
      });

      test('Создание элемента с правильным стилем', () => {
        function expectOffsetStyle(offsetDirection: OffsetDirection): void {
          testMarkup['addMark']({
            ...defaultMarkupParams,
            ...{ offsetDirection, relativePosition: 0.5 },
          });

          expect(testMarkup.getWrap().innerHTML).toBe(
            `<div class="liquid-slider__markup" style="${offsetDirection}: 52.5%;"></div>`,
          );
        }
        expectOffsetStyle('left');
        testMarkup.getWrap().innerHTML = '';
        expectOffsetStyle('top');
      });
    });
  });

  test('Очистка всех меток', () => {
    testMarkup = new MarkupView(testSliderContainer, testHandlersContainer);
    const marks = new Array(Math.floor(Math.random() * Math.floor(100))).fill(null);

    marks.forEach(() => {
      testMarkup['addMark']({ ...defaultMarkupParams, ...{ relativePosition: 0.5 } });
    });
    testMarkup.clearAllMarks();

    expect(testMarkup['marks'].length).toBe(0);
    expect(testMarkup.getWrap().innerHTML).toBe('');
  });
});
