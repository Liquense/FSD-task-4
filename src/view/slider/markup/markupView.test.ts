/* eslint-disable dot-notation,no-undef */
import View from '../../defaultView';
import SliderView from '../sliderView';
import MarkupView from './markupView';
import { KeyStringObj } from '../../../utils/types';

document.body.innerHTML = '<div class="liquidSlider liquidSlider_horizontal"></div>';
const sliderContainer = document.querySelector('.liquidSlider') as HTMLElement;
const view = new View(sliderContainer, {});
let slider: SliderView & KeyStringObj = new SliderView(view, { withMarkup: true });
let markup: MarkupView & KeyStringObj;

describe('Инициализация экземпляра разметки', () => {
  test('Конструктор разметки правильно заполняет владельца-слайдера', () => {
    expect(new MarkupView(slider).ownerSlider).toBe(slider);
  });

  test('Вызывается создание элемента', () => {
    const oldFunc = MarkupView.prototype['_createWrap'];
    const mockFunc = jest.fn(() => undefined);

    MarkupView.prototype['_createWrap'] = mockFunc;

    markup = new MarkupView(slider);

    MarkupView.prototype['_createWrap'] = oldFunc;
    expect(mockFunc.mock.calls.length).toBe(1);
  });
});

describe('Функционал разметки', () => {
  beforeAll(() => {
    markup = new MarkupView(slider);
    markup['wrap'].outerHTML = '';
  });

  test('Создание обертки на странице', () => {
    markup['_createWrap']();
    expect(
      slider.bodyElement.innerHTML
        .includes(markup['wrap'].outerHTML),
    ).toBeTruthy();
  });

  test('Получение ширины метки', () => {
    const dimension = slider.expandDimension;
    markup.addMark(null, null);

    expect(markup['_getMarkThickness']())
      .toBe((markup['_marks'][0].getBoundingClientRect() as KeyStringObj)[dimension]);
  });

  describe('Получение относительной ширины метки', () => {
    beforeAll(() => {
      slider = new SliderView(view, { withMarkup: true });

      markup = new MarkupView(slider);
      markup['_getMarkThickness'] = jest.fn(() => 1);
    });

    test('При нулевой или отсутствующей длине шкалы', () => {
      slider.getScaleLength = jest.fn(() => 0);
      expect(markup['_getRelativeMarkThickness']()).toBe(0);
    });

    test('При правильной длине шкалы', () => {
      slider.getScaleLength = jest.fn(() => 100);
      expect(markup['_getRelativeMarkThickness']()).toBe(0.01);
    });
  });

  describe('Добавление метки', () => {
    beforeEach(() => {
      slider = new SliderView(view, { withMarkup: true });
      markup = new MarkupView(slider);
    });

    test('Добавление в массив меток', () => {
      const arrayLength = markup['_marks'].length;
      markup.addMark(null, null);
      expect(markup['_marks'].length).toBe(arrayLength + 1);
    });

    describe('Создание и размещение', () => {
      beforeEach(() => {
        slider['_elements']['scale'] = document.body;
      });

      test('Правильный расчёт смещения', () => {
        markup.addMark(null, null);
        expect(markup['_calculateMarkOffset'](0.5, 0)).toBe(50);
        expect(markup['_calculateMarkOffset'](0.5, 0.1)).toBe(55);
        expect(markup['_calculateMarkOffset'](0, 0.1)).toBe(5);
      });

      test('Создание элемента с правильным стилем', () => {
        function expectOffsetStyle(): void {
          markup.addMark(0.5, 0);
          expect(markup['wrap'].innerHTML).toBe(
            `<div class="liquidSlider__markup ${slider.getOrientationClass()}" style="${slider.offsetDirection}: 50%;"></div>`,
          );
        }

        slider.isVertical = false;
        expectOffsetStyle();

        slider.isVertical = true;
        markup['wrap'].innerHTML = '';
        expectOffsetStyle();
      });
    });
  });

  test('Очистка всех меток', () => {
    markup = new MarkupView(slider);
    const marksCount = Math.floor(Math.random() * Math.floor(100));
    for (let i = 0; i < marksCount; i += 1) {
      markup.addMark(null, null);
    }
    markup.clearAllMarks();

    expect(markup['_marks'].length).toBe(0);
    expect(markup['wrap'].innerHTML).toBe('');
  });
});
