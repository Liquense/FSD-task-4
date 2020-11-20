/* eslint-disable dot-notation,no-undef,@typescript-eslint/ban-ts-ignore */
import { KeyStringObj } from '../utils/types';

import SliderModel from './SliderModel';
import HandlerModel from './handler/HandlerModel';
import { HandlersModelData } from './types';
import { DEFAULT_SLIDER_PARAMS } from '../constants';

let testModel: SliderModel & KeyStringObj;

describe('Инициализация', () => {
  describe('Конструктор', () => {
    test('Создание без передачи нестандартных параметров', () => {
      testModel = new SliderModel(DEFAULT_SLIDER_PARAMS);
      expect(testModel.getSliderData())
        .toStrictEqual({ ...DEFAULT_SLIDER_PARAMS, ...{ range: 10 } });
      expect(testModel.getHandlersData()).toStrictEqual(
        {
          isCustomHandlers: false,
          handlersArray: [{
            handlerIndex: 0, positionPart: 0.5, item: 5, itemIndex: 5,
          }],
        },
      );
    });

    test('Создание с передачей items', () => {
      testModel = new SliderModel(
        { ...DEFAULT_SLIDER_PARAMS, ...{ isRange: true, max: 3, items: [2, 6, 12, 15] } },
      );
      expect(testModel.getSliderData())
        .toStrictEqual({ ...DEFAULT_SLIDER_PARAMS, ...{ max: 3, range: 3 } });
      expect(testModel.getHandlersData()).toStrictEqual({
        isCustomHandlers: false,
        handlersArray: [
          {
            handlerIndex: 0, positionPart: (1 / 3), item: 6, itemIndex: 1,
          },
          {
            handlerIndex: 1, positionPart: (2 / 3), item: 12, itemIndex: 2,
          },
        ],
      });
    });

    test('С передачей своих значений хэндлеров', () => {
      testModel = new SliderModel(
        { ...DEFAULT_SLIDER_PARAMS, ...{ handlers: [{ itemIndex: 1 }, { itemIndex: 3 }] } },
      );
      expect(testModel.getSliderData()).toStrictEqual(
        { ...DEFAULT_SLIDER_PARAMS, ...{ range: 10 } },
      );
      expect(testModel.getHandlersData()).toStrictEqual({
        isCustomHandlers: true,
        handlersArray: [
          {
            handlerIndex: 0, positionPart: 0.1, item: 1, itemIndex: 1,
          },
          {
            handlerIndex: 1, positionPart: 0.3, item: 3, itemIndex: 3,
          },
        ],
      });
    });
  });

  describe('Установка полей', () => {
    beforeEach(() => {
      testModel = new SliderModel(DEFAULT_SLIDER_PARAMS);
    });

    describe('Создание хэндлеров с пользовательскими значениями', () => {
      let prevHandlers: HandlerModel[];
      let testHandlers = [0, 4];

      beforeAll(() => {
        testModel.setItems(null);
      });

      test('При передаче значения, приводимого к false или пустого массива, функция не выполняется', () => {
        prevHandlers = testModel['handlers'];

        testModel['createHandlers'](null);
        expect(testModel['handlers']).toBe(prevHandlers);

        testModel['createHandlers']([]);
        expect(testModel['handlers']).toBe(prevHandlers);
      });

      test('создание хэндлеров без пользовательского набора значений', () => {
        testModel['createHandlers'](testHandlers);
        expect(testModel['handlers'][0].handlerIndex).toBe(0);
        expect(testModel['handlers'][0].getItemIndex()).toBe(0);
        expect(testModel['handlers'][0].getItem()).toBe(0);
        expect(testModel['handlers'][0].getPosition()).toBe(0);

        expect(testModel['handlers'][1].handlerIndex).toBe(1);
        expect(testModel['handlers'][1].getItemIndex()).toBe(4);
        expect(testModel['handlers'][1].getItem()).toBe(4);
        expect(testModel['handlers'][1].getPosition()).toBe(0.4);
      });

      test('Ситуация, когда не хватает значений на все хэндлеры', () => {
        testModel['min'] = 0;
        testModel['max'] = 1;
        testModel['step'] = 1;
        testModel['createHandlers']([0, 2, 1]);
        expect(testModel['handlers'].length).toBe(2);
      });

      test('Cоздание хэндлеров при наличии пользовательского набора значений', () => {
        testHandlers = [1, 4];
        testModel.setItems([1, 'test', 3]);
        testModel['createHandlers'](testHandlers);
        expect(testModel['handlers'][0].handlerIndex).toBe(0);
        expect(testModel['handlers'][0].getItemIndex()).toBe(1);
        expect(testModel['handlers'][0].getItem()).toBe('test');
        expect(testModel['handlers'][0].getPosition()).toBe(0.5);

        expect(testModel['handlers'][1].handlerIndex).toBe(1);
        expect(testModel['handlers'][1].getItemIndex()).toBe(2);
        expect(testModel['handlers'][1].getItem()).toBe(3);
        expect(testModel['handlers'][1].getPosition()).toBe(1);
      });
    });

    describe('Занятие и освобождение значений', () => {
      beforeEach(() => {
        testModel = new SliderModel();
      });

      test('Занятие значения', () => {
        const oldOccupiedItems = testModel['occupiedItems'];

        testModel.occupyItem(4, 0);
        oldOccupiedItems[4] = 0;
        expect(testModel['occupiedItems']).toStrictEqual(oldOccupiedItems);
      });

      test('Освобождение значения', () => {
        const oldOccupiedItems = testModel['occupiedItems'];

        testModel['occupiedItems'][4] = 0;
        testModel.releaseItem(4);
        expect(testModel['occupiedItems']).toStrictEqual(oldOccupiedItems);
      });

      test('Проверка занятости значения', () => {
        testModel['occupiedItems'][4] = 0;
        expect(testModel.isItemOccupied(4)).toBeTruthy();

        expect(testModel.isItemOccupied(2)).toBeFalsy();
      });
    });
  });

  describe('Обмен данными', () => {
    beforeEach(() => {
      testModel = new SliderModel(DEFAULT_SLIDER_PARAMS);
    });

    describe('Получение из модели данных о хэндлерах', () => {
      const testParameters = {
        ...DEFAULT_SLIDER_PARAMS,
        ...{ handlers: [{ itemIndex: 1 }, { itemIndex: 3 }] },
      };
      beforeEach(() => {
        testModel = new SliderModel(testParameters);
      });

      test(('Пользовательские хэндлеры'), () => {
        expect(testModel.getHandlersData()).toStrictEqual({
          isCustomHandlers: true,
          handlersArray: [
            {
              handlerIndex: 0, item: 1, positionPart: 0.1, itemIndex: 1,
            }, {
              handlerIndex: 1,
              item: 3,
              positionPart: 0.3,
              itemIndex: 3,
            },
          ],
        });
      });

      test('Стандартные хэндлеры', () => {
        testModel = new SliderModel({ ...DEFAULT_SLIDER_PARAMS, ...{ isRange: true } });
        expect(testModel.getHandlersData()).toStrictEqual({
          isCustomHandlers: false,
          handlersArray: [
            {
              handlerIndex: 0, item: 3, positionPart: 0.3, itemIndex: 3,
            }, {
              handlerIndex: 1,
              item: 7,
              positionPart: 0.7,
              itemIndex: 7,
            },
          ],
        });
      });
    });

    test('Получение из модели данных для слайдера', () => {
      testModel = new SliderModel({ ...DEFAULT_SLIDER_PARAMS, ...{ min: -44, max: 44, step: 10 } });
      expect(testModel.getPositioningData())
        .toStrictEqual({ stepPart: (10 / 88), min: -44, max: 44 });
    });

    describe('Обработка изменения позиции хэндлера', () => {
      let spyGetItemIndexFromPosition: jest.SpyInstance;
      const testData = { handlerIndex: 0, position: 0.6 };
      let spySetItemIndex: jest.SpyInstance;

      beforeEach(() => {
        spyGetItemIndexFromPosition = jest.spyOn(testModel, 'getItemIndexFromPosition');
        spySetItemIndex = jest.spyOn(testModel['handlers'][testData.handlerIndex], 'setItemIndex');
      });

      test('Обычная ситуация', () => {
        testModel.handleHandlerPositionChanged(testData);
        expect(spyGetItemIndexFromPosition).toBeCalledWith(testData.position);
        expect(spySetItemIndex).toBeCalledWith(spyGetItemIndexFromPosition.mock.results[0].value);
      });

      test('Если последнее значение не делится ровно на шаг', () => {
        testModel.setSliderParams({ step: 3 });
        testData.position = 1;

        testModel.handleHandlerPositionChanged(testData);
        expect(spySetItemIndex).toBeCalledWith(10);
      });
    });

    test('Обработчик изменения значения хэндлера', () => {
      const testedHandler = testModel['handlers'][0];

      expect(testModel.handleHandlerValueChanged(testedHandler)).toStrictEqual({
        handlerIndex: 0, positionPart: 0.5, item: 5, itemIndex: 5,
      });
    });
  });
});

describe('Функции', () => {
  beforeEach(() => {
    testModel = new SliderModel(DEFAULT_SLIDER_PARAMS);
  });

  test('Установка набора пользовательских значений', () => {
    const testItems = [1, 'test', 3];

    testModel.setItems(null);
    expect(testModel['items']).toBe(null);

    testModel.setItems(testItems);
    expect(testModel['items']).toBe(testItems);
  });

  describe('Установка минимальных и максимальных значений', () => {
    let oldMax: number;
    let oldMin: number;
    let newMin: number;
    let newMax: number;

    beforeEach(() => {
      oldMax = testModel.getSliderData().max;
      oldMin = testModel.getSliderData().min;
    });

    describe('Установка минимума', () => {
      test('Если минимум больше максимума - ничего не происходит', () => {
        newMin = 20;
        testModel.setSliderParams({ min: newMin });
        expect(testModel.getSliderData().min).toBe(oldMin);
      });

      test('Нормальная ситуация', () => {
        newMin = 5;
        testModel.setSliderParams({ min: newMin });
        expect(testModel.getSliderData().min).toBe(newMin);
        expect(testModel.getHandlersData().handlersArray[0].itemIndex)
          .toBeGreaterThanOrEqual(newMin);
      });
    });

    describe('Установка максимума', () => {
      test('Если максимум меньше минимума - ничего не произойдёт', () => {
        newMax = -1;
        testModel.setSliderParams({ max: newMax });
        expect(testModel.getSliderData().max).toBe(oldMax);
      });

      test('Штатная ситуация', () => {
        newMax = 30;
        testModel.setSliderParams({ max: newMax });
        expect(testModel.getSliderData().max).toBe(newMax);
      });
    });

    describe('Установка минимума и максимума', () => {
      test('Если минимум больше максимума - ничего не происходит', () => {
        oldMax = testModel.getSliderData().max;
        newMin = 10;
        newMax = 0;
        testModel.setSliderParams({ min: newMin, max: newMax });
        expect(testModel.getSliderData().min).toBe(oldMin);
        expect(testModel.getSliderData().max).toBe(oldMax);
      });

      test('Штатная ситуация', () => {
        newMin = -100;
        newMax = 100;
        testModel.setSliderParams({ min: newMin, max: newMax });
        expect(testModel.getSliderData().min).toBe(newMin);
        expect(testModel.getSliderData().max).toBe(newMax);
      });
    });
  });

  describe('Установка шага значений', () => {
    test('Если переданы пользовательские значения, то шаг округляется', () => {
      testModel.setItems(['']);
      testModel.setSliderParams({ step: 2.6 });
      expect(testModel.getSliderData().step).toBe(3);
    });

    test('Если пользовательские значения не переданы, шаг может быть и дробным', () => {
      testModel.setItems(null);
      testModel.setSliderParams({ step: 2.6 });
      expect(testModel.getSliderData().step).toBe(2.6);
    });
  });

  describe('Добавление хэндлера', () => {
    let oldHandlersData: HandlersModelData;

    test('Нормальная ситуация', () => {
      oldHandlersData = testModel.getHandlersData();

      testModel.addHandler(7);
      const newHandlersData = testModel.getHandlersData();
      expect(newHandlersData.handlersArray.pop().itemIndex).toBe(7);
      expect(newHandlersData.handlersArray).toStrictEqual(oldHandlersData.handlersArray);
    });

    test('Если все значения заняты, ничего не произойдёт', () => {
      testModel.setSliderParams({ min: 0, max: 0, step: 1 });
      oldHandlersData = testModel.getHandlersData();

      const functionResult = testModel.addHandler(1);
      expect(testModel.getHandlersData()).toStrictEqual(oldHandlersData);
      expect(functionResult).toBe(null);
    });
  });

  describe('Удаление хэндлера', () => {
    let oldHandlers: HandlerModel[];
    let removingResult: number;
    let removingIndex = 1;

    beforeEach(() => {
      testModel.addHandler(7);
      testModel.addHandler(8);
      testModel.addHandler(9);
      oldHandlers = [...testModel['handlers']];
    });

    test('Штатная ситуация', () => {
      expect(testModel['handlers'].some((handler) => handler.handlerIndex === removingIndex)).toBeTruthy();
      removingResult = testModel.removeHandler(removingIndex);
      expect(testModel['handlers'].length === oldHandlers.length - 1).toBeTruthy();
      expect(testModel['handlers'].some((handler) => handler.handlerIndex === removingIndex)).toBeFalsy();
      expect(removingResult).toBe(removingIndex);
    });

    test('Если хэндлера с таким индексом нет', () => {
      removingIndex = 111;
      expect(testModel['handlers'].some((handler) => handler.handlerIndex === removingIndex)).toBeFalsy();
      removingResult = testModel.removeHandler(removingIndex);
      expect(testModel['handlers'].length === oldHandlers.length).toBeTruthy();
      expect(removingResult).toBe(null);
    });
  });
});
