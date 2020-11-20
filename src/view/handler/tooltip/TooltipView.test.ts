/* eslint-disable dot-notation */
import { KeyStringObj, Presentable } from '../../../utils/types';

import HandlerView from '../HandlerView';

import TooltipView from './TooltipView';

jest.mock('../handlerView');

const handler = new HandlerView(null, null, null);
handler.getBody = jest.fn(() => document.body);

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('Создание экземпляра', () => {
  let createElementFunc: Function;
  let setVisibilityFunc: Function;
  const mockCreateElement = jest.fn();
  const mockSetVisibility = jest.fn();

  beforeAll(() => {
    createElementFunc = TooltipView.prototype['createElement'];
    TooltipView.prototype['createElement'] = mockCreateElement.mockImplementation(
      function (parentElement) {
        createElementFunc.apply(this, [parentElement]);
      },
    );

    setVisibilityFunc = TooltipView.prototype.setVisibility;
    TooltipView.prototype.setVisibility = mockSetVisibility;
  });

  test('Запуск функций для инициализации', () => {
    const testTooltip = new TooltipView(handler.getBody());

    expect(mockCreateElement).toBeCalled();
    expect(mockSetVisibility).toBeCalled();
  });

  test('Корректное заполнение свойств', () => {
    const tooltip: TooltipView & KeyStringObj = new TooltipView(handler.getBody());
    expect(tooltip.getItem()).toBe(undefined);

    mockSetVisibility.mock.calls = [];
    const testTooltip = new TooltipView(handler.getBody(),
      {
        isVisible: false,
        item: 'testValue',
        bodyHTML: '<div></div>',
      });
    expect(mockSetVisibility.mock.calls[0][0]).toBe(false);
  });

  test('Создание элемента в DOM', () => {
    document.body.innerHTML = '';
    const testTooltip = new TooltipView(handler.getBody());

    expect(document.body.innerHTML)
      .toBe('<div class="liquid-slider__handler-tooltip">undefined</div>');
  });

  afterAll(() => {
    TooltipView.prototype['createElement'] = function (parentElement): void {
      createElementFunc.apply(this, [parentElement]);
    };
    TooltipView.prototype.setVisibility = function (visibilityState): void {
      setVisibilityFunc.apply(this, [visibilityState]);
    };
  });
});
describe('Функционал', () => {
  describe('Установка видимости', () => {
    let tooltip: TooltipView;

    beforeAll(() => {
      tooltip = new TooltipView(handler.getBody());
    });

    test('Показать', () => {
      tooltip.setVisibility(true);
      expect(tooltip.getElement().classList).toContain('liquid-slider__handler-tooltip_visible');
      expect(tooltip.getElement().classList).not.toContain('liquid-slider__handler-tooltip_hidden');
    });

    test('Скрыть', () => {
      tooltip.setVisibility(false);
      expect(tooltip.getElement().classList).toContain('liquid-slider__handler-tooltip_hidden');
      expect(tooltip.getElement().classList).not.toContain('liquid-slider__handler-tooltip_visible');
    });
  });

  describe('Получение размера', () => {
    const tooltip = new TooltipView(handler.getBody());
    expect(tooltip.getSize('width')).toBe(tooltip.getElement().getBoundingClientRect().width);
    expect(tooltip.getSize('height')).toBe(tooltip.getElement().getBoundingClientRect().height);
  });

  test('Установка значения', () => {
    const tooltip = new TooltipView(handler.getBody());

    function testValueChange(testValue: Presentable): void {
      tooltip.setItem(testValue);
      expect(tooltip.getItem()).toBe(testValue);
      expect(tooltip.getElement().innerHTML).toBe(testValue.toString());
    }

    testValueChange('testValue');
    testValueChange(1);
    testValueChange(true);
    testValueChange('<div>something</div>');
  });
});
