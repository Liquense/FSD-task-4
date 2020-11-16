/* eslint-disable dot-notation,no-undef */
import { KeyStringObj } from '../../utils/types';

import SliderView from '../SliderView';
import MarkupView from './MarkupView';
import { DEFAULT_SLIDER_PARAMS } from '../../constants';

jest.mock('../SliderView');

document.body.innerHTML = '<div class="liquidSlider liquidSlider_horizontal"></div>';
const testSliderContainer = document.querySelector('.liquidSlider') as HTMLElement;
const defaultSliderParams = {
  ...DEFAULT_SLIDER_PARAMS,
  ...{
    range: 10, stepPart: 0.1, isInverted: false, isMarkupVisible: true,
  },
};
let mockSlider: SliderView & KeyStringObj = new SliderView(
  testSliderContainer,
  defaultSliderParams,
);
mockSlider.getBodyElement = jest.fn(() => testSliderContainer);
let testMarkup: MarkupView & KeyStringObj;

describe('Инициализация экземпляра разметки', () => {
  test('Конструктор разметки правильно заполняет владельца-слайдера', () => {
    expect(new MarkupView(mockSlider)['ownerSlider']).toBe(mockSlider);
  });

  test('Вызывается создание элемента', () => {
    const oldFunc = MarkupView.prototype['createWrap'];
    const mockFunc = jest.fn(() => undefined);

    MarkupView.prototype['createWrap'] = mockFunc;

    testMarkup = new MarkupView(mockSlider);

    MarkupView.prototype['createWrap'] = oldFunc;
    expect(mockFunc.mock.calls.length).toBe(1);
  });
});

describe('Функционал разметки', () => {
  beforeAll(() => {
    testMarkup = new MarkupView(mockSlider);
    testMarkup.getWrap().outerHTML = '';
  });

  test('Создание обертки на странице', () => {
    testMarkup['createWrap']();
    expect(
      mockSlider.getBodyElement().innerHTML
        .includes(testMarkup.getWrap().outerHTML),
    ).toBeTruthy();
  });

  test('Получение ширины метки', () => {
    const dimension = mockSlider.getExpandDimension();
    testMarkup.addMark(null, null);

    expect(testMarkup['getMarkThickness']())
      .toBe((testMarkup['marks'][0].getBoundingClientRect() as KeyStringObj)[dimension]);
  });

  describe('Получение относительной ширины метки', () => {
    beforeAll(() => {
      mockSlider = new SliderView(testSliderContainer, defaultSliderParams);
      mockSlider.getBodyElement = jest.fn(() => testSliderContainer);
      testMarkup = new MarkupView(mockSlider);
      testMarkup['getMarkThickness'] = jest.fn(() => 1);
    });

    test('При нулевой или отсутствующей длине шкалы', () => {
      mockSlider.getScaleLength = jest.fn(() => 0);
      expect(testMarkup['getRelativeMarkThickness']()).toBe(0);
    });

    test('При правильной длине шкалы', () => {
      mockSlider.calculateShrinkRatio = jest.fn(() => 1);
      mockSlider.getScaleLength = jest.fn(() => 100);
      expect(testMarkup['getRelativeMarkThickness']()).toBe(0.01);
    });
  });

  describe('Добавление метки', () => {
    beforeEach(() => {
      mockSlider = new SliderView(testSliderContainer, defaultSliderParams);
      mockSlider.getBodyElement = jest.fn(() => testSliderContainer);
      testMarkup = new MarkupView(mockSlider);
    });

    test('Добавление в массив меток', () => {
      const arrayLength = testMarkup['marks'].length;
      testMarkup.addMark(null, null);
      expect(testMarkup['marks'].length).toBe(arrayLength + 1);
    });

    describe('Создание и размещение', () => {
      beforeEach(() => {
        mockSlider['elements'] = {
          scale: null, max: null, body: null, wrap: null, min: null, handlers: null,
        };
        mockSlider['elements'].scale = document.body;
      });

      test('Правильный расчёт смещения', () => {
        testMarkup.addMark(null, null);
        expect(testMarkup['calculateMarkOffset'](0.5, 0)).toBe(50);
        expect(testMarkup['calculateMarkOffset'](0.5, 0.1)).toBe(55);
        expect(testMarkup['calculateMarkOffset'](0, 0.1)).toBe(5);
      });

      test('Создание элемента с правильным стилем', () => {
        function expectOffsetStyle(): void {
          testMarkup.addMark(0.5, 0);
          expect(testMarkup.getWrap().innerHTML).toBe(
            `<div class="liquid-slider__markup" style="${mockSlider.getOffsetDirection()}: 50%;"></div>`,
          );
        }

        mockSlider.setOrientation(false);
        mockSlider.getOffsetDirection = jest.fn(() => 'left');
        expectOffsetStyle();

        mockSlider.setOrientation(true);
        mockSlider.getOffsetDirection = jest.fn(() => 'top');
        testMarkup.getWrap().innerHTML = '';
        expectOffsetStyle();
      });
    });
  });

  test('Очистка всех меток', () => {
    testMarkup = new MarkupView(mockSlider);
    const marksCount = Math.floor(Math.random() * Math.floor(100));
    for (let i = 0; i < marksCount; i += 1) {
      testMarkup.addMark(null, null);
    }
    testMarkup.clearAllMarks();

    expect(testMarkup['marks'].length).toBe(0);
    expect(testMarkup.getWrap().innerHTML).toBe('');
  });
});
