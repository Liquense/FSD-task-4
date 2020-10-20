/* eslint-disable dot-notation,@typescript-eslint/ban-ts-ignore */
import { KeyStringObj } from '../types';

import SliderModel from '../model/sliderModel';

import View from '../view/pluginView';
import { addListenerAfter } from '../utils/functions';
import Controller from './controller';

jest.mock('../utils/functions');
jest.mock('../view/pluginView');
jest.mock('../model/sliderModel');

let testController: Controller & KeyStringObj;
const rootElement = document.createElement('div');
document.body.appendChild(rootElement);

const mockAddListenerAfter = addListenerAfter as jest.Mock;
const mockModel = SliderModel as jest.Mock;
const mockView = View as jest.Mock;

describe('Инициализация контроллера', () => {
  beforeEach(() => {
    mockAddListenerAfter.mockClear();
    mockModel.mockClear();
    mockView.mockClear();
  });

  test('Создание и присваивание экземпляров SliderModel и View', () => {
    testController = new Controller(rootElement);

    expect(testController['views'][0]).toBe(mockView.mock.instances[0]);
    expect(testController['model']).toBe(mockModel.mock.instances[0]);
  });

  test('Назначение слушателей на нужные функции', () => {
    testController = new Controller(rootElement);

    expect(mockAddListenerAfter).toBeCalledWith(
      'handlerValueChanged',
      testController['passHandlerValueChange'],
      testController['model'],
    );
    expect(mockAddListenerAfter).toBeCalledWith(
      'handleHandlerPositionChanged',
      testController['passHandlerPositionChange'],
      testController['views'][0],
    );
  });

  test('Передача данных о слайдере от модели к виду', () => {
    const testData = {
      step: 0, absoluteStep: 0, min: 0, max: 0,
    };
    SliderModel.prototype.getSliderData = jest.fn(() => testData);

    testController = new Controller(rootElement);

    expect(testController['model'].getSliderData).toBeCalled();
    expect(testController['views'][0].passDataProps).toBeCalledWith(testData);
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
      expect(testController['views'][0].initHandlers).toBeCalledWith(undefined);
    });

    test('C опциональными параметрами (стандартные хэндлеры)', () => {
      const testParameters = {};
      const testHandlersData = { customHandlers: false, handlersArray: testHandlersArray };

      SliderModel.prototype.getHandlersData = jest.fn(() => testHandlersData);

      testController = new Controller(rootElement, testParameters);
      expect(testController['model'].getHandlersData).toBeCalled();
      expect(testController['views'][0].initHandlers).toBeCalledWith(testHandlersData);
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
      expect(testController['views'][0].initHandlers).toBeCalledWith({
        customHandlers: false,
        handlersArray: testHandlersArray.map(
          (handler, index) => (
            { ...testHandlersData2[index], ...handler }),
        ),
      });
    });
  });
});

describe('Функции', () => {
  function clearObjsFunctionMock(objs: KeyStringObj[], mockFunctionName: string): void {
    objs.forEach((view) => {
      if (mockFunctionName in view) { view[mockFunctionName].mockClear(); }
    });
  }

  beforeAll(() => {
    testController = new Controller(rootElement);
  });

  describe('Добавление новых видов', () => {
    test('Один', () => {
      const handlersDataModel = testController['model'].getHandlersData();

      const views = [...testController['views']];
      const testView = new View(null);
      testController.addView(testView);
      views.push(testView);
      expect(testController['views']).toStrictEqual(views);
      expect(testView.initHandlers).toBeCalledWith(handlersDataModel);

      const testHandlers = [{ itemIndex: 2 }, { itemIndex: 3, somethingElse: 'test1' }];
      testController = new Controller(rootElement, { handlers: testHandlers });
      testController.addView(testView);
      handlersDataModel.handlersArray[0] = {
        ...handlersDataModel.handlersArray[0],
        ...testHandlers[0],
      };
      expect(testView.initHandlers).toBeCalledWith(handlersDataModel);
    });

    test('Несколько', () => {
      const mockAddView = jest.spyOn(testController, 'addView');

      const oldViews = [...testController['views']];
      const testViews = [
        new View(null, null),
        new View(null, null),
      ];
      testController.addViews(testViews);
      const newViews = [...oldViews, ...testViews];
      expect(testController['views']).toStrictEqual(newViews);
      expect(mockAddView).toBeCalledTimes(testViews.length);
    });
  });

  test('Добавление хэндлера', () => {
    const testHandlerData = { test1: 'test', test2: 'another data' };

    testController.addHandler(222, 2);
    expect(testController['model'].addHandler).toBeCalledWith(222);
    testController['views'].forEach((view) => {
      expect(view.addHandler).not.toBeCalled();
    });

    (testController['model'].addHandler as jest.Mock).mockImplementationOnce(() => testHandlerData);
    testController.addHandler(111, null);
    expect(testController['model'].addHandler).toBeCalledWith(111);
    testController['views'].forEach((view) => {
      expect(view.addHandler).toBeCalledWith({ ...testHandlerData, rangePair: null });
    });
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

  test('Назначение минимума, максимума и шага', () => {
    clearObjsFunctionMock(testController['views'], 'passDataProps');

    testController.setMin(null);
    testController.setMax(null);
    testController.setStep(null);
    expect(testController['model'].setMin).not.toBeCalled();
    expect(testController['model'].setMax).not.toBeCalled();
    expect(testController['model'].setStep).not.toBeCalled();
    testController['views'].forEach((view) => {
      expect(view.passDataProps).not.toBeCalled();
    });

    const randomNumber = Math.random();
    (testController['model'].getSliderData as jest.Mock).mockImplementation(() => randomNumber);

    testController.setMin(1);
    expect(testController['model'].setMin).toBeCalledWith(1);
    testController['views'].forEach((view) => {
      expect(view.passDataProps).toBeCalledWith(testController['model'].getSliderData());
    });

    testController.setMax(2);
    expect(testController['model'].setMax).toBeCalledWith(2);
    testController['views'].forEach((view) => {
      expect(view.passDataProps).toBeCalledWith(testController['model'].getSliderData());
    });

    testController.setStep(3);
    expect(testController['model'].setStep).toBeCalledWith(3);
    testController['views'].forEach((view) => {
      expect(view.passDataProps).toBeCalledWith(testController['model'].getSliderData());
    });
  });

  test('Назначение видимости подсказок и разметки и вертикального отображения слайдера', () => {
    clearObjsFunctionMock(testController['views'], 'passVisualProps');

    testController.setTooltipVisibility(null);
    testController.setVertical(null);
    testController.setMarkupVisibility(null);
    testController['views'].forEach((view) => {
      expect(view.passVisualProps).not.toBeCalled();
    });

    testController.setTooltipVisibility(true);
    testController['views'].forEach((view) => {
      expect(view.passVisualProps).toBeCalledWith({ tooltipsVisible: true });
    });

    testController.setVertical(false);
    testController['views'].forEach((view) => {
      expect(view.passVisualProps).toBeCalledWith({ isVertical: false });
    });

    testController.setMarkupVisibility(true);
    testController['views'].forEach((view) => {
      expect(view.passVisualProps).toBeCalledWith({ withMarkup: true });
    });
  });

  test('Передача позиции хэндлера в модель', () => {
    mockModel.mockClear();

    const testData = { index: 0, position: 0.5 };
    testController['passHandlerPositionChange'](testData);

    expect(testController['model'].handleHandlerPositionChanged).toBeCalledWith(testData);
  });

  test('Передача изменения значения хэндлера в вид', () => {
    mockView.mockClear();

    const testData = { index: 0, relativeValue: 0.5, item: 'test!' };
    testController['passHandlerValueChange'](testData);

    expect(testController['views'][0].handlersValuesChangedListener)
      .toBeCalledWith(testData);
  });
});
