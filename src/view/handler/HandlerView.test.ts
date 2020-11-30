import { KeyStringObj, Presentable } from '../../utils/types';

import HandlerView from './HandlerView';

import TooltipView from './tooltip/TooltipView';
import { HandlerPair } from '../types';

jest.mock('../SliderView');
jest.mock('./tooltip/TooltipView');

const defaultHandlerUpdatePositionParams = {
  workZoneLength: 100,
  offsetDirection: 'left' as const,
  expandDimension: 'width' as const,
};

let testHandler: HandlerView;
function createTestHandler(
  index = 0, positionPart = 0.5, item: Presentable = 'test', isVertical = false,
): HandlerView {
  return new HandlerView(
    document.body,
    { handlerIndex: index, positionPart, item },
    {
      workZoneLength: 100,
      offsetDirection: isVertical ? 'top' : 'left',
      expandDimension: isVertical ? 'height' : 'width',
    },
  );
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
      testHandler = createTestHandler();

      expect(testHandler.getIndex()).toBe(index);
      expect(testHandler.getPositionPart()).toBe(positionPart);
      expect(testHandler.getPair()).toBe(null);
      expect(mockTooltip).toBeCalledWith(
        testHandler.getElement().wrap,
        { isVisible: true, item },
      );
    });

    test('с необязательными параметрами', () => {
      mockTooltip.mockClear();
      const isTooltipVisible = false;
      const rangePair: HandlerPair = null;
      testHandler = new HandlerView(
        document.body,
        {
          handlerIndex: index, positionPart, item, isTooltipVisible, rangePair,
        },
        defaultHandlerUpdatePositionParams,
      );

      expect(testHandler.getPair()).toBe(rangePair);
      expect(mockTooltip).toBeCalledWith(
        testHandler.getElement().wrap,
        { isVisible: isTooltipVisible, item },
      );
    });
  });
});

test('Установка позиции', () => {
  mockTooltip.mockClear();
  testHandler = createTestHandler();
  testHandler.getHandlerBody().getBoundingClientRect = jest.fn(() => ({
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

  function checkSettingPosition(isVertical: boolean, positionPart: number): void {
    testHandler.setPosition({
      ...{ positionPart },
      ...{
        workZoneLength: 100,
        offsetDirection: isVertical ? 'top' : 'left',
        expandDimension: isVertical ? 'height' : 'width',
      },
    });
    expect((testHandler.getElement().wrap.style as KeyStringObj)[isVertical ? 'top' : 'left'])
      .toBe(`${positionPart * 100}px`);
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

  expect(testHandler.getPositionCoordinate(false)).toBe(5);
  expect(testHandler.getPositionCoordinate(true)).toBe(15);
});

describe('Вспомогательные функции', () => {
  beforeEach(() => {
    mockTooltip.mockClear();
    document.body.innerHTML = '';
    testHandler = createTestHandler();
  });

  test('Получение HTML-тела', () => {
    const handlerElement = document.body.querySelector('.liquid-slider__handler-body');

    expect(testHandler.getHandlerBody()).toBe(handlerElement);
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
