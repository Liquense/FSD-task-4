/* eslint-disable no-undef,@typescript-eslint/ban-ts-ignore,dot-notation */
import Controller from './controller';
import Model from '../model/model';
import View from '../view/view';
import { addListenerAfter } from '../utils/common';
import { KeyStringObj } from '../utils/types';

jest.mock('../utils/common');
jest.mock('../view/view');
jest.mock('../model/model');

let testController: Controller & KeyStringObj;
const rootElement = document.createElement('div');
document.body.appendChild(rootElement);

const mockAddListenerAfter = addListenerAfter as unknown as jest.Mock;
const mockModel = Model as unknown as jest.Mock;
const mockView = View as unknown as jest.Mock;

const viewsParamName = '_views';
describe('Инициализация контроллера', () => {
  beforeEach(() => {
    mockAddListenerAfter.mockClear();
    mockModel.mockClear();
    mockView.mockClear();
  });

  test('Создание и присваивание экземпляров Model и View', () => {
    testController = new Controller(rootElement);

    expect(testController[viewsParamName][0]).toBe(mockView.mock.instances[0]);
    expect(testController['_model']).toBe(mockModel.mock.instances[0]);
  });

  test('Назначение слушателей на нужные функции', () => {
    testController = new Controller(rootElement);

    expect(mockAddListenerAfter).toBeCalledWith(
      'handlerValueChanged',
      testController['_boundPassHandlerValueChange'],
      testController['_model'],
    );
    expect(mockAddListenerAfter).toBeCalledWith(
      'handlerPositionChanged',
      testController['_boundPassHandlerPositionChange'],
      testController[viewsParamName][0],
    );
  });

  test('Передача данных о слайдере от модели к виду', () => {
    const testData = { test: 'data1' };
    // @ts-ignore
    Model.prototype.getSliderData = jest.fn(() => testData);

    testController = new Controller(rootElement);

    expect(testController['_model'].getSliderData).toBeCalled();
    expect(testController[viewsParamName][0].passDataProps).toBeCalledWith(testData);
  });

  describe('Передача данных о хэндлерах в вид', () => {
    test('Без опциональных параметров', () => {
      testController = new Controller(rootElement);

      expect(testController['_model'].getHandlersData).toBeCalled();
      expect(testController[viewsParamName][0].initHandlers).toBeCalledWith(undefined);
    });

    test('C опциональными параметрами', () => {
      // Без кастомных хэндлеров
      let testParameters = {};
      const testHandlersArray = [
        { index: 0, value: 'test1', positionPart: 0.5 },
        { index: 1, value: 'test2', positionPart: 1 },
      ];
      const testHandlersData = { customHandlers: false, handlersArray: testHandlersArray };

      // @ts-ignore
      Model.prototype.getHandlersData = jest.fn(() => testHandlersData);

      // @ts-ignore
      testController = new Controller(rootElement, testParameters);
      expect(testController['_model'].getHandlersData).toBeCalled();
      expect(testController[viewsParamName][0].initHandlers).toBeCalledWith(testHandlersData);

      // с кастомными хэндлерами
      const testHandlersData2 = [
        { value: 2, withTooltip: true, isEnd: false },
        { value: 3 },
      ];

      testParameters = { handlers: testHandlersData2 };
      mockView.mockClear();
      mockModel.mockClear();

      testController = new Controller(rootElement, testParameters);
      expect(testController['_model'].getHandlersData).toBeCalled();
      expect(testController[viewsParamName][0].initHandlers).toBeCalledWith({
        customHandlers: false,
        handlersArray: [
          {
            index: 0, value: 'test1', positionPart: 0.5, withTooltip: true, isEnd: false,
          },
          { index: 1, value: 'test2', positionPart: 1 },
        ],
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
      const handlersDataModel = testController['_model'].getHandlersData();

      const views = [...testController[viewsParamName]];
      const testView = new View(null);
      testController.addView(testView);
      views.push(testView);
      expect(testController[viewsParamName]).toStrictEqual(views);
      expect(testView.initHandlers).toBeCalledWith(handlersDataModel);

      // с хэндлерами, переданными при создании контроллера
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

      const oldViews = [...testController[viewsParamName]];
      const testViews = [
        new View(null, null),
        new View(null, null),
      ];
      testController.addViews(testViews);
      const newViews = [...oldViews, ...testViews];
      expect(testController[viewsParamName]).toStrictEqual(newViews);
      expect(mockAddView).toBeCalledTimes(testViews.length);
    });
  });

  test('Добавление хэндлера', () => {
    const testHandlerData = { test1: 'test', test2: 'another data' };

    testController.addHandler(222, 2);
    expect(testController['_model'].addHandler).toBeCalledWith(222);
    testController['_views'].forEach((view) => {
      expect(view.addHandler).not.toBeCalled();
    });

    (testController['_model'].addHandler as jest.Mock).mockImplementationOnce(() => testHandlerData);
    testController.addHandler(111, null);
    expect(testController['_model'].addHandler).toBeCalledWith(111);
    testController['_views'].forEach((view) => {
      expect(view.addHandler).toBeCalledWith({ ...testHandlerData, rangePair: null });
    });
  });

  test('Удаление хэндлера', () => {
    (testController['_model'].removeHandler as jest.Mock)
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => true);

    testController.removeHandler(1);
    expect(testController['_model'].removeHandler).toBeCalledWith(1);
    testController['_views'].forEach((view) => {
      expect(view.removeHandler).not.toBeCalled();
    });

    testController.removeHandler(2);
    expect(testController['_model'].removeHandler).toBeCalledWith(2);
    testController['_views'].forEach((view) => {
      expect(view.removeHandler).toBeCalledWith(2);
    });
  });

  test('Назначение минимума, максимума и шага', () => {
    clearObjsFunctionMock(testController['_views'], 'passDataProps');

    testController.setMin(null);
    testController.setMax(null);
    testController.setStep(null);
    expect(testController['_model'].setMinMax).not.toBeCalled();
    expect(testController['_model'].setStep).not.toBeCalled();
    testController['_views'].forEach((view) => {
      expect(view.passDataProps).not.toBeCalled();
    });

    const randomNumber = Math.random();
    (testController['_model'].getSliderData as jest.Mock).mockImplementation(() => randomNumber);
    // минимум
    testController.setMin(1);
    expect(testController['_model'].setMinMax).toBeCalledWith({ min: 1 });
    testController['_views'].forEach((view) => {
      expect(view.passDataProps).toBeCalledWith(testController['_model'].getSliderData());
    });
    // максимум
    testController.setMax(2);
    expect(testController['_model'].setMinMax).toBeCalledWith({ max: 2 });
    testController['_views'].forEach((view) => {
      expect(view.passDataProps).toBeCalledWith(testController['_model'].getSliderData());
    });
    // шаг
    testController.setStep(3);
    expect(testController['_model'].setStep).toBeCalledWith({ step: 3 });
    testController['_views'].forEach((view) => {
      expect(view.passDataProps).toBeCalledWith(testController['_model'].getSliderData());
    });
  });

  test('Назначение видимости подсказок и разметки и вертикального отображения слайдера', () => {
    clearObjsFunctionMock(testController['_views'], 'passVisualProps');

    testController.setTooltipVisibility(null);
    testController.setVertical(null);
    testController.setMarkupVisibility(null);
    testController['_views'].forEach((view) => {
      expect(view.passVisualProps).not.toBeCalled();
    });

    // минимум
    testController.setTooltipVisibility(true);
    testController['_views'].forEach((view) => {
      expect(view.passVisualProps).toBeCalledWith({ tooltipsVisible: true });
    });
    // максимум
    testController.setVertical(false);
    testController['_views'].forEach((view) => {
      expect(view.passVisualProps).toBeCalledWith({ isVertical: false });
    });
    // шаг
    testController.setMarkupVisibility(true);
    testController['_views'].forEach((view) => {
      expect(view.passVisualProps).toBeCalledWith({ withMarkup: true });
    });
  });

  test('Передача позиции хэндлера в модель', () => {
    mockModel.mockClear();

    const testData = { index: 0, position: 0.5 };
    testController['_passHandlerPositionChange'](testData);

    expect(testController['_model'].handleHandlerPositionChanged).toBeCalledWith(testData);
  });

  test('Передача изменения значения хэндлера в вид', () => {
    mockView.mockClear();

    const testData = { index: 0, relativeValue: 0.5, item: 'test!' };
    testController['_passHandlerValueChange'](testData);

    expect(testController[viewsParamName][0].handlersValuesChangedListener)
      .toBeCalledWith(testData);
  });
});
