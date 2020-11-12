/* eslint-disable dot-notation,@typescript-eslint/ban-ts-ignore */
import { KeyStringObj } from '../utils/types';

import SliderModel from '../model/SliderModel';

import View from '../view/PluginView';
import Controller from './Controller';
import { SliderData } from '../model/types';
import { Observer } from '../utils/Observer/Observer';

jest.mock('../utils/functions');
jest.mock('../view/pluginView');
jest.mock('../model/sliderModel');
jest.mock('../utils/Observer/Observer');

let testController: Controller & KeyStringObj;
const rootElement = document.createElement('div');
document.body.appendChild(rootElement);

const mockAddListener = Observer.addListener as jest.Mock;
const mockModel = SliderModel as jest.Mock;
const mockView = View as jest.Mock;

describe('Инициализация контроллера', () => {
  beforeEach(() => {
    mockAddListener.mockClear();
    mockModel.mockClear();
    mockView.mockClear();
  });

  test('Создание и присваивание экземпляров SliderModel и View', () => {
    testController = new Controller(rootElement);

    expect(testController['view']).toBe(mockView.mock.instances[0]);
    expect(testController['model']).toBe(mockModel.mock.instances[0]);
  });

  test('Назначение слушателей на нужные функции', () => {
    testController = new Controller(rootElement);

    expect(mockAddListener).toBeCalledWith(
      'handleHandlerValueChanged',
      testController['model'],
      testController['passHandlerValueChange'],
    );
    expect(mockAddListener).toBeCalledWith(
      'handleHandlerPositionChanged',
      testController['view'],
      testController['passHandlerPositionChange'],
    );
  });

  test('Передача данных о слайдере от модели к виду', () => {
    const testData = { stepPart: 0, min: 0, max: 0 };
    SliderModel.prototype.getPositioningData = jest.fn(() => testData);

    testController = new Controller(rootElement);

    expect(testController['model'].getPositioningData).toBeCalled();
    expect(testController['view'].updatePositioning).toBeCalledWith(testData);
  });

  describe('Передача данных о хэндлерах в вид', () => {
    const testHandlersArray = [
      {
        handlerIndex: 0, item: 'test1', positionPart: 0.5, itemIndex: 0,
      },
      {
        handlerIndex: 1, item: 'test2', positionPart: 1, itemIndex: 1,
      },
    ];

    test('Без опциональных параметров', () => {
      testController = new Controller(rootElement);

      expect(testController['model'].getHandlersData).toBeCalled();
      expect(testController['view'].initHandlers).toBeCalledWith(undefined);
    });

    test('C опциональными параметрами (стандартные хэндлеры)', () => {
      const testParameters = {};
      const testHandlersData = { isCustomHandlers: false, handlersArray: testHandlersArray };

      SliderModel.prototype.getHandlersData = jest.fn(() => testHandlersData);

      testController = new Controller(rootElement, testParameters);
      expect(testController['model'].getHandlersData).toBeCalled();
      expect(testController['view'].initHandlers).toBeCalledWith(testHandlersData);
    });

    test('C опциональными параметрами (пользовательские хэндлеры)', () => {
      const testHandlersData2 = [
        {
          itemIndex: 2, value: 2, withTooltip: true, isEnd: false,
        },
        { itemIndex: 3, value: 3 },
      ];

      const testParameters = { handlers: testHandlersData2 };
      mockView.mockClear();
      mockModel.mockClear();

      testController = new Controller(rootElement, testParameters);
      expect(testController['model'].getHandlersData).toBeCalled();
      expect(testController['view'].initHandlers).toBeCalledWith({
        isCustomHandlers: false,
        handlersArray: testHandlersArray.map(
          (handler, index) => (
            { ...testHandlersData2[index], ...handler }),
        ),
      });
    });
  });
});

describe('Функции', () => {
  beforeAll(() => {
    testController = new Controller(rootElement);
  });

  beforeEach(() => {
    mockAddListener.mockClear();
    mockModel.mockClear();
    mockView.mockClear();
  });

  test('Добавление хэндлера', () => {
    const testHandlerData = { test1: 'test', test2: 'another data' };

    testController.addHandler(222, 2);
    expect(testController['model'].addHandler).toBeCalledWith(222);
    expect(testController['view'].addHandler).not.toBeCalled();

    (testController['model'].addHandler as jest.Mock).mockImplementationOnce(() => testHandlerData);
    testController.addHandler(111, null);
    expect(testController['model'].addHandler).toBeCalledWith(111);
    expect(testController['view'].addHandler).toBeCalledWith(
      { ...testHandlerData, rangePair: null },
    );
  });

  test('Удаление хэндлера', () => {
    (testController['model'].removeHandler as jest.Mock)
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => true);

    testController.removeHandler(1);
    expect(testController['model'].removeHandler).toBeCalledWith(1);

    testController.removeHandler(2);
    expect(testController['model'].removeHandler).toBeCalledWith(2);
  });

  test('Назначение параметров слайдера', () => {
    const testParams = { step: 1, min: 2, isVertical: true };
    const testPositioningData = { stepPart: 0.125, min: 2, max: 10 };
    const testSliderData: SliderData = {
      max: 10,
      step: 1,
      min: 0,
      isMarkupVisible: true,
      isTooltipsVisible: false,
      isVertical: false,
      range: 10,
    };

    testController['model'].getPositioningData = jest.fn(() => testPositioningData);
    testController['model'].getSliderData = jest.fn(() => testSliderData);

    testController.update(testParams);
    expect(testController['model'].setSliderParams).toBeCalledWith(testParams);
    expect(testController['view'].updatePositioning)
      .toBeCalledWith(testController['model'].getPositioningData());
    expect(testController['view'].updateVisuals)
      .toBeCalledWith(testController['model'].getSliderData());
  });

  test('Передача изменения значения хэндлера в вид', () => {
    const testData = {
      handlerIndex: 0, positionPart: 0.5, item: 'test!', itemIndex: 0,
    };
    testController['passHandlerValueChange'](testData);

    expect(testController['view'].handlerValueChangedListener)
      .toBeCalledWith(testData);
  });

  test('Функции назначения слушателей', () => {
    const testListener = (): string => 'i\'m a mock function';

    mockAddListener.mockClear();
    testController.addAfterHandlerValueChangedListener(testListener);
    expect(mockAddListener)
      .toBeCalledWith('handleHandlerValueChanged', testController['model'], testListener);

    mockAddListener.mockClear();
    testController.addAfterRemoveHandlerListener(testListener);
    expect(mockAddListener)
      .toBeCalledWith('removeHandler', testController['model'], testListener);
  });

  test('Функция перемещения хэндлера', () => {
    const testIndex = 0;
    const testPositionPart = 0.5;
    testController.moveHandler(testIndex, testPositionPart);

    expect(testController['model']
      .handleHandlerPositionChanged)
      .toBeCalledWith({ handlerIndex: testIndex, positionPart: testPositionPart });
  });

  test('Получение данных о слайдере', () => {
    const testModelData = {
      min: -1, max: 5, step: 3, range: 6,
    };
    const testVisualData = {
      isVertical: true, isMarkupVisible: false, isTooltipsVisible: false, isInverted: false,
    };
    const testData = { ...testModelData, ...testVisualData };

    testController['model'].getSliderData = jest.fn(() => testData);
    expect(testController.getSliderData()).toStrictEqual(testController['model'].getSliderData());
  });
});
