/* eslint-disable dot-notation,no-undef */
import { KeyStringObj } from '../../../utils/interfaces-types';

import View from '../../pluginView';

import SliderView from '../sliderView';

import MarkupView from './markupView';

document.body.innerHTML = '<div class="liquidSlider liquidSlider_horizontal"></div>';
const testSliderContainer = document.querySelector('.liquidSlider') as HTMLElement;
const testView = new View(testSliderContainer, {});
let testSlider: SliderView & KeyStringObj = new SliderView(testView, { withMarkup: true });
let testMarkup: MarkupView & KeyStringObj;

describe('Инициализация экземпляра разметки', () => {
  test('Конструктор разметки правильно заполняет владельца-слайдера', () => {
    expect(new MarkupView(testSlider).ownerSlider).toBe(testSlider);
  });

  test('Вызывается создание элемента', () => {
    const oldFunc = MarkupView.prototype['createWrap'];
    const mockFunc = jest.fn(() => undefined);

    MarkupView.prototype['createWrap'] = mockFunc;

    testMarkup = new MarkupView(testSlider);

    MarkupView.prototype['createWrap'] = oldFunc;
    expect(mockFunc.mock.calls.length).toBe(1);
  });
});

describe('Функционал разметки', () => {
  beforeAll(() => {
    testMarkup = new MarkupView(testSlider);
    testMarkup.getWrap().outerHTML = '';
  });

  test('Создание обертки на странице', () => {
    testMarkup['createWrap']();
    expect(
      testSlider.getBodyElement().innerHTML
        .includes(testMarkup.getWrap().outerHTML),
    ).toBeTruthy();
  });

  test('Получение ширины метки', () => {
    const dimension = testSlider.getExpandDimension();
    testMarkup.addMark(null, null);

    expect(testMarkup['getMarkThickness']())
      .toBe((testMarkup['marks'][0].getBoundingClientRect() as KeyStringObj)[dimension]);
  });

  describe('Получение относительной ширины метки', () => {
    beforeAll(() => {
      testSlider = new SliderView(testView, { withMarkup: true });

      testMarkup = new MarkupView(testSlider);
      testMarkup['getMarkThickness'] = jest.fn(() => 1);
    });

    test('При нулевой или отсутствующей длине шкалы', () => {
      testSlider.getScaleLength = jest.fn(() => 0);
      expect(testMarkup['getRelativeMarkThickness']()).toBe(0);
    });

    test('При правильной длине шкалы', () => {
      testSlider.getScaleLength = jest.fn(() => 100);
      expect(testMarkup['getRelativeMarkThickness']()).toBe(0.01);
    });
  });

  describe('Добавление метки', () => {
    beforeEach(() => {
      testSlider = new SliderView(testView, { withMarkup: true });
      testMarkup = new MarkupView(testSlider);
    });

    test('Добавление в массив меток', () => {
      const arrayLength = testMarkup['marks'].length;
      testMarkup.addMark(null, null);
      expect(testMarkup['marks'].length).toBe(arrayLength + 1);
    });

    describe('Создание и размещение', () => {
      beforeEach(() => {
        testSlider['elements']['scale'] = document.body;
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
            `<div class="liquid-slider__markup" style="${testSlider.getOffsetDirection()}: 50%;"></div>`,
          );
        }

        testSlider.setOrientation(false);
        expectOffsetStyle();

        testSlider.setOrientation(true);
        testMarkup.getWrap().innerHTML = '';
        expectOffsetStyle();
      });
    });
  });

  test('Очистка всех меток', () => {
    testMarkup = new MarkupView(testSlider);
    const marksCount = Math.floor(Math.random() * Math.floor(100));
    for (let i = 0; i < marksCount; i += 1) {
      testMarkup.addMark(null, null);
    }
    testMarkup.clearAllMarks();

    expect(testMarkup['marks'].length).toBe(0);
    expect(testMarkup.getWrap().innerHTML).toBe('');
  });
});
