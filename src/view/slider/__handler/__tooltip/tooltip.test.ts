/* eslint-disable no-undef,dot-notation */
import HandlerView from '../handler';
import Tooltip from './tooltip';
import Slider from '../../slider';
import { KeyStringObj, Presentable } from '../../../../utils/types';

jest.mock('../handler');
jest.mock('../../slider');


const defaultOrientationClass = 'defaultOrientClass';

const slider = new Slider(null, {});
slider.getOrientationClass = jest.fn(() => defaultOrientationClass);

const handler = new HandlerView(null, { handlerIndex: 0, positionPart: 0, item: 'test' });
handler.ownerSlider = slider;
handler.element = { body: document.body, wrap: null };


beforeEach(() => {
  document.body.innerHTML = '';
});

describe('Создание экземпляра', () => {
  let createElementFunc: Function; let setVisibilityFunc: Function; let
    initDefaultParametersFunc: Function;
  const mockCreateElement = jest.fn(); const mockSetVisibility = jest.fn(); const
    mockInitDefaultParameters = jest.fn();

  beforeAll(() => {
    createElementFunc = Tooltip.prototype['_createElement'];
    Tooltip.prototype['_createElement'] = mockCreateElement.mockImplementation(
      function (parentElement) { createElementFunc.apply(this, [parentElement]); },
    );

    setVisibilityFunc = Tooltip.prototype.setVisibility;
    Tooltip.prototype.setVisibility = mockSetVisibility;

    initDefaultParametersFunc = Tooltip.prototype['_initDefaultParameters'];
    Tooltip.prototype['_initDefaultParameters'] = mockInitDefaultParameters.mockImplementation(
      function () { return initDefaultParametersFunc.apply(this); },
    );
  });

  test('Запуск функций для инициализации', () => {
    const testTooltip = new Tooltip(handler.element.body, handler);

    expect(mockCreateElement).toBeCalled();
    expect(mockSetVisibility).toBeCalled();
    expect(mockInitDefaultParameters).toBeCalled();
  });

  test('Корректное заполнение свойств', () => {
    const tooltip: Tooltip & KeyStringObj = new Tooltip(handler.element.body, handler);
    expect(tooltip.value).toBe(undefined);

    mockSetVisibility.mock.calls = [];
    const testTooltip = new Tooltip(handler.element.body, handler,
      {
        visibilityState: false,
        item: 'testValue',
        bodyHTML: '<div></div>',
      });
    expect(mockSetVisibility.mock.calls[0][0]).toBe(false);
  });

  test('Создание элемента в DOM', () => {
    document.body.innerHTML = '';
    const testTooltip = new Tooltip(handler.element.body, handler);

    expect(handler.element.body.innerHTML)
      .toBe('<div class="liquidSlider__handlerTooltip defaultOrientClass">undefined</div>');
  });

  afterAll(() => {
    Tooltip.prototype['_createElement'] = function (parentElement) {
      createElementFunc.apply(this, [parentElement]);
    };
    Tooltip.prototype.setVisibility = function (visibilityState) {
      setVisibilityFunc.apply(this, [visibilityState]);
    };
    Tooltip.prototype['_initDefaultParameters'] = function () {
      return initDefaultParametersFunc.apply(this);
    };
  });
});
describe('Функционал', () => {
  describe('Установка видимости', () => {
    let tooltip: Tooltip;

    beforeAll(() => {
      tooltip = new Tooltip(handler.element.body, handler);
    });

    test('Показать', () => {
      tooltip.setVisibility(true);
      expect(tooltip.element.classList).toContain('liquidSlider__handlerTooltip_visible');
      expect(tooltip.element.classList).not.toContain('liquidSlider__handlerTooltip_hidden');
    });

    test('Скрыть', () => {
      tooltip.setVisibility(false);
      expect(tooltip.element.classList).toContain('liquidSlider__handlerTooltip_hidden');
      expect(tooltip.element.classList).not.toContain('liquidSlider__handlerTooltip_visible');
    });
  });

  test('Получение размера', () => {
    const tooltip = new Tooltip(handler.element.body, handler);

    slider.isVertical = false;
    expect(tooltip.getSize()).toBe(tooltip.element.getBoundingClientRect().width);

    slider.isVertical = true;
    expect(tooltip.getSize()).toBe(tooltip.element.getBoundingClientRect().height);
  });

  test('Установка значения', () => {
    const tooltip = new Tooltip(handler.element.body, handler);

    function testValueChange(testValue: Presentable): void {
      tooltip.value = testValue;
      expect(tooltip['_value']).toBe(testValue);
      expect(tooltip['_innerHTML']).toBe(testValue.toString());
      expect(tooltip['_element'].innerHTML).toBe(testValue.toString());
    }

    testValueChange('testValue');
    testValueChange(1);
    testValueChange(true);
    testValueChange('<div>something</div>');
  });
});
