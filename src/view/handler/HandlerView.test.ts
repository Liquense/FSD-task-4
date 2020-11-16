import { KeyStringObj, Presentable } from '../../utils/types';

import SliderView from '../SliderView';

import HandlerView from './HandlerView';

import TooltipView from './tooltip/TooltipView';
import { HandlerPair } from '../types';

jest.mock('../SliderView');
jest.mock('./tooltip/TooltipView');

const mockSlider = new SliderView(null, null);
mockSlider.getOrientationClass = jest.fn(
  function () {
    return this.isVertical ? 'vertical' : 'horizontal';
  },
);

mockSlider.getHandlersContainer = jest.fn(() => document.body);

let testHandler: HandlerView;
function createTestHandler(
  index = 0, positionPart = 0.5, item: Presentable = 'test',
): HandlerView {
  return new HandlerView(mockSlider, { handlerIndex: index, positionPart, item });
}

const mockTooltip = (TooltipView as unknown as jest.Mock);

describe('Инициализация', () => {
  describe('Установка значений полей', () => {
    const index = 0;
    const positionPart = 0.5;
    const item = 'test';

    beforeAll(() => {
      mockTooltip.mockClear();
    });

    test('с только обязательными параметрами', () => {
      testHandler = createTestHandler(index, positionPart, item);

      expect(testHandler.getIndex()).toBe(index);
      expect(testHandler.getPositionPart()).toBe(positionPart);
      expect(testHandler.getPair()).toBe(null);
      expect(mockTooltip).toBeCalledWith(
        testHandler.getElement().wrap,
        testHandler, { isVisible: true, item },
      );
    });

    test('с необязательными параметрами', () => {
      mockTooltip.mockClear();
      const isTooltipVisible = false;
      const rangePair: HandlerPair = null;
      testHandler = new HandlerView(mockSlider, {
        handlerIndex: index, positionPart, item, isTooltipVisible, rangePair,
      });

      expect(testHandler.getPair()).toBe(rangePair);
      expect(mockTooltip).toBeCalledWith(
        testHandler.getElement().wrap,
        testHandler, { isVisible: isTooltipVisible, item },
      );
    });
  });
});

test('Установка позиции', () => {
  mockTooltip.mockClear();
  testHandler = createTestHandler();
  testHandler.getBody().getBoundingClientRect = jest.fn(() => ({
    height: 10,
    width: 10,
    x: 0,
    y: 0,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    toJSON: undefined,
  }));

  mockTooltip.prototype.getSize.mockImplementation(() => 10);

  function checkSettingPosition(isVertical: boolean, value: number): void {
    mockSlider.getOffsetDirection = jest.fn(() => (isVertical ? 'top' : 'left'));
    mockSlider.getExpandDimension = jest.fn(() => (isVertical ? 'height' : 'width'));
    mockSlider.getWorkZoneLength = jest.fn(() => 100);

    testHandler.setPosition(value);
    expect((testHandler.getElement().wrap.style as KeyStringObj)[mockSlider.getOffsetDirection()])
      .toBe(`${value * 100}px`);
    expect(mockTooltip.prototype.updateHTML).toBeCalled();
  }

  checkSettingPosition(true, 0.5);
  checkSettingPosition(false, 0.1);
});

test('Получение центра хэндлера', () => {
  testHandler = createTestHandler();
  testHandler.getElement().body.getBoundingClientRect = jest.fn(() => ({
    height: 10,
    width: 10,
    left: 0,
    top: 10,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
    toJSON: undefined,
  }));

  mockSlider.getIsVertical = jest.fn(() => false);
  expect(testHandler.getPositionCoordinate()).toBe(5);

  mockSlider.getIsVertical = jest.fn(() => true);
  expect(testHandler.getPositionCoordinate()).toBe(15);
});

describe('Вспомогательные функции', () => {
  beforeEach(() => {
    mockTooltip.mockClear();
    document.body.innerHTML = '';
    testHandler = createTestHandler();
  });

  test('Получение HTML-тела', () => {
    const body = document.body.querySelector('.liquid-slider__handler-body');

    expect(testHandler.getBody()).toBe(body);
  });

  test('Установка видимости тултипа', () => {
    testHandler.setTooltipVisibility(true);
    expect(mockTooltip.prototype.setVisibility).toBeCalledWith(true);

    testHandler.setTooltipVisibility(false);
    expect(mockTooltip.prototype.setVisibility).toBeCalledWith(false);
  });

  test('Удаление', () => {
    expect(document.body.innerHTML).toBe(testHandler.getElement().wrap.outerHTML);
    testHandler.remove();
    expect(document.body.innerHTML).toBe('');
  });

  test('Получение значения', () => {
    const testItem = 'test';
    mockTooltip.prototype.getItem.mockImplementationOnce(() => testItem);

    expect(testHandler.getItem()).toBe(testItem);
  });

  test('Получение элемента подсказки ползунка', () => {
    const testElement = 'testElement';
    mockTooltip.prototype.getElement.mockImplementationOnce(() => testElement);

    expect(testHandler.getTooltipElement()).toBe(testElement);
  });
});
