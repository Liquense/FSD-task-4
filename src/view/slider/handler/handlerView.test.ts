/* eslint-disable no-undef,@typescript-eslint/ban-ts-ignore */
import HandlerView from './handlerView';
import SliderView from '../sliderView';
import TooltipView from './tooltip/tooltipView';
import { KeyStringObj, Presentable } from '../../../utils/types';

import Mock = jest.Mock;

jest.mock('../sliderView');
jest.mock('./tooltip/tooltipView');

const verticalClass = 'vertical';
const horizontalClass = 'horizontal';
const testSlider = new SliderView(null, null);
testSlider.getOrientationClass = jest.fn(function () {
  return this.isVertical ? verticalClass : horizontalClass;
});
// для простоты длина слайдера будет 100
testSlider.calculateHandlerOffset = jest.fn((positionPart) => positionPart * 100);
let testHandler: HandlerView;
// @ts-ignore
testSlider.handlersContainer = document.body;

function createTestHandler(index = 0, positionPart = 0.5, value: Presentable = 'test') {
  return new HandlerView(testSlider, { handlerIndex: index, positionPart, item: value });
}

describe('Инициализация', () => {
  test('Установка значений полей', async () => {
    const mockTooltip = (TooltipView as unknown as Mock);
    mockTooltip.mockClear();
    // только с обязательными параметрами
    const index = 0;
    const positionPart = 0.5;
    const item = 'test';
    testHandler = createTestHandler(index, positionPart, item);

    expect(testHandler.index).toBe(index);
    expect(testHandler.positionPart).toBe(positionPart);
    expect(testHandler.value).toBe(item);
    expect(testHandler.rangePair).toBe(undefined);
    expect(mockTooltip).toBeCalledWith(
      testHandler.element.wrap,
      testHandler, { visibilityState: true, item },
    );
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        expect(testHandler.tooltip.updateHTML).toBeCalled();
        resolve();
      });
    });

    // с необязательными параметрами
    mockTooltip.mockClear();
    const withTooltip = false;
    const rangePair: string = null;
    testHandler = new HandlerView(testSlider, {
      handlerIndex: index, positionPart, item, withTooltip, rangePair,
    });

    expect(testHandler.rangePair).toBe(rangePair);
    expect(mockTooltip).toBeCalledWith(
      testHandler.element.wrap,
      testHandler, { visibilityState: withTooltip, item },
    );
  });
});

test('Установка позиции', () => {
  testHandler = createTestHandler();
  testHandler.element.body.getBoundingClientRect = jest.fn(() => ({
    // поскольку в тестах ничего не рендерится и функция всегда будет возвращать нули,
    // вручную зададим размер элемента (остальное не интересует)
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

  testHandler.tooltip.getSize = function () {
    return 10;
  };

  function checkSettingPosition(isVertical: boolean, value: number) {
    // @ts-ignore
    testSlider.expandDimension = isVertical ? 'height' : 'width';
    // @ts-ignore
    testSlider.offsetDirection = isVertical ? 'top' : 'left';

    (testHandler.tooltip.updateHTML as Mock).mockClear();
    testHandler.setPosition(value);
    expect((testHandler.element.wrap.style as KeyStringObj)[testSlider.offsetDirection]).toBe(`${value * 100}px`);
    expect(testHandler.tooltip.updateHTML).toBeCalled();
  }

  checkSettingPosition(true, 0.5);
  checkSettingPosition(false, 0.1);

  (testHandler.tooltip.updateHTML as Mock).mockClear();
  testHandler.element = undefined;
  testHandler.setPosition(0.5);
  expect(testHandler.tooltip.updateHTML).not.toBeCalled();
});

test('Получение центра хэндлера', () => {
  testHandler = createTestHandler();
  testHandler.element.body.getBoundingClientRect = jest.fn(() => ({
    // поскольку в тестах ничего не рендерится и функция всегда будет возвращать нули,
    // вручную зададим размер элемента (остальное не интересует)
    height: 10,
    width: 10,
    left: 0,
    top: 10, // для рассчета центра элемента
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
    toJSON: undefined,
  }));

  testSlider.isVertical = false;
  expect(testHandler.positionCoordinate).toBe(5);

  testSlider.isVertical = true;
  expect(testHandler.positionCoordinate).toBe(15);
});

describe('Вспомогательные функции', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    testHandler = createTestHandler();
  });

  test('Получение HTML-тела', () => {
    const body = document.body.querySelector('.liquidSlider__handlerBody');

    expect(testHandler.body).toBe(body);
  });

  test('Установка видимости тултипа', () => {
    const mockTooltip = (TooltipView as unknown as Mock);
    mockTooltip.mockClear();

    let testingVisibilityState = true;
    testHandler.setTooltipVisibility(testingVisibilityState);
    expect(testHandler.tooltip.setVisibility).toBeCalledWith(testingVisibilityState);

    testingVisibilityState = false;
    testHandler.setTooltipVisibility(testingVisibilityState);
    expect(testHandler.tooltip.setVisibility).toBeCalledWith(testingVisibilityState);
  });

  test('Удаление', () => {
    expect(document.body.innerHTML).toBe(testHandler.element.wrap.outerHTML);
    testHandler.remove();
    expect(document.body.innerHTML).toBe('');
  });
});
