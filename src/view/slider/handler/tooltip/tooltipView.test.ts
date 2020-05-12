/* eslint-disable no-undef,dot-notation */
import HandlerView from '../handlerView';
import TooltipView from './tooltipView';
import SliderView from '../../sliderView';
import { KeyStringObj, Presentable } from '../../../../utils/types';

jest.mock('../handlerView');
jest.mock('../../sliderView');


const defaultOrientationClass = 'defaultOrientClass';

const slider = new SliderView(null, {});
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
    createElementFunc = TooltipView.prototype['_createElement'];
    TooltipView.prototype['_createElement'] = mockCreateElement.mockImplementation(
      function (parentElement) { createElementFunc.apply(this, [parentElement]); },
    );

    setVisibilityFunc = TooltipView.prototype.setVisibility;
    TooltipView.prototype.setVisibility = mockSetVisibility;

    initDefaultParametersFunc = TooltipView.prototype['_initDefaultParameters'];
    TooltipView.prototype['_initDefaultParameters'] = mockInitDefaultParameters.mockImplementation(
      function () { return initDefaultParametersFunc.apply(this); },
    );
  });

  test('Запуск функций для инициализации', () => {
    const testTooltip = new TooltipView(handler.element.body, handler);

    expect(mockCreateElement).toBeCalled();
    expect(mockSetVisibility).toBeCalled();
    expect(mockInitDefaultParameters).toBeCalled();
  });

  test('Корректное заполнение свойств', () => {
    const tooltip: TooltipView & KeyStringObj = new TooltipView(handler.element.body, handler);
    expect(tooltip.value).toBe(undefined);

    mockSetVisibility.mock.calls = [];
    const testTooltip = new TooltipView(handler.element.body, handler,
      {
        visibilityState: false,
        item: 'testValue',
        bodyHTML: '<div></div>',
      });
    expect(mockSetVisibility.mock.calls[0][0]).toBe(false);
  });

  test('Создание элемента в DOM', () => {
    document.body.innerHTML = '';
    const testTooltip = new TooltipView(handler.element.body, handler);

    expect(handler.element.body.innerHTML)
      .toBe('<div class="liquidSlider__handlerTooltip defaultOrientClass">undefined</div>');
  });

  afterAll(() => {
    TooltipView.prototype['_createElement'] = function (parentElement) {
      createElementFunc.apply(this, [parentElement]);
    };
    TooltipView.prototype.setVisibility = function (visibilityState) {
      setVisibilityFunc.apply(this, [visibilityState]);
    };
    TooltipView.prototype['_initDefaultParameters'] = function () {
      return initDefaultParametersFunc.apply(this);
    };
  });
});
describe('Функционал', () => {
  describe('Установка видимости', () => {
    let tooltip: TooltipView;

    beforeAll(() => {
      tooltip = new TooltipView(handler.element.body, handler);
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
    const tooltip = new TooltipView(handler.element.body, handler);

    slider.isVertical = false;
    expect(tooltip.getSize()).toBe(tooltip.element.getBoundingClientRect().width);

    slider.isVertical = true;
    expect(tooltip.getSize()).toBe(tooltip.element.getBoundingClientRect().height);
  });

  test('Установка значения', () => {
    const tooltip = new TooltipView(handler.element.body, handler);

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
