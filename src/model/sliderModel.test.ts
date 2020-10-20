/* eslint-disable dot-notation,no-undef,@typescript-eslint/ban-ts-ignore */
import { KeyStringObj } from '../types';

import SliderModel from './sliderModel';
import HandlerModel from './handler/handlerModel';

let testModel: SliderModel & KeyStringObj;

describe('Инициализация', () => {
  describe('Конструктор', () => {
    const origSetStep = SliderModel.prototype.setStep;
    SliderModel.prototype.setStep = jest.fn();
    const mockSetStep = SliderModel.prototype.setStep;

    const origSetItems = SliderModel.prototype.setItems;
    SliderModel.prototype.setItems = jest.fn();
    const mockSetItems = SliderModel.prototype.setItems;

    const origCreateCustomHandlers = SliderModel.prototype['createHandlers'];
    SliderModel.prototype['createHandlers'] = jest.fn();
    const mockCreateCustomHandlers = SliderModel.prototype['createHandlers'];

    const origGenerateDefaultHandlers = SliderModel.prototype['generateDefaultHandlersItemIndexes'];
    SliderModel.prototype['generateDefaultHandlersItemIndexes'] = jest.fn();
    const mockGenerateDefaultHandlers = SliderModel.prototype['generateDefaultHandlersItemIndexes'];

    test('Создание без передачи параметров', () => {
      testModel = new SliderModel();
      expect(testModel.getMin()).toBe(0);
      expect(testModel.getMax()).toBe(10);
      expect(mockSetStep).toBeCalledWith(undefined);
      expect(mockSetItems).toBeCalledWith(undefined);
      expect(mockGenerateDefaultHandlers).toBeCalledWith(1, undefined);
    });

    test('Создание с передачей данных (items) и установкой диапазона', () => {
      const testParameters = { isRange: true, max: 100, items: [2, 6, 12] };
      testModel = new SliderModel(testParameters);
      expect(testModel.getMin()).toBe(0);
      expect(testModel.getMax()).toBe(100);
      expect(mockSetStep).toBeCalledWith(undefined);
      expect(mockSetItems).toBeCalledWith(testParameters.items);
      expect(mockGenerateDefaultHandlers).toBeCalledWith(2, undefined);

      const testParameters2 = { isRange: true, max: 100, values: [2, 6, 10] };
      testModel = new SliderModel(testParameters2);
      expect(testModel.getMin()).toBe(0);
      expect(testModel.getMax()).toBe(100);
      expect(mockSetStep).toBeCalledWith(undefined);
      expect(mockSetItems).toBeCalledWith(undefined);
      expect(mockGenerateDefaultHandlers).toBeCalledWith(2, testParameters2.values);
    });

    test('С передачей своих значений хэндлеров', () => {
      const testParameters3 = { handlers: [{ itemIndex: 1 }, { itemIndex: 3 }] };
      testModel = new SliderModel(testParameters3);
      expect(testModel.getMin()).toBe(0);
      expect(testModel.getMax()).toBe(10);
      expect(mockSetStep).toBeCalledWith(undefined);
      expect(mockSetItems).toBeCalledWith(undefined);
      expect(mockCreateCustomHandlers).toBeCalledWith(testParameters3.handlers);

      SliderModel.prototype.setStep = origSetStep;
      SliderModel.prototype.setItems = origSetItems;
      SliderModel.prototype['createHandlers'] = origCreateCustomHandlers;
      SliderModel.prototype['generateDefaultHandlersItemIndexes'] = origGenerateDefaultHandlers;
    });
  });

  describe('Установка полей', () => {
    beforeEach(() => {
      testModel = new SliderModel();
    });

    describe('Создание хэндлеров с пользовательскими значениями', () => {
      let prevHandlers: HandlerModel[];
      let testHandlers = [{ itemIndex: 0 }, { itemIndex: 4 }];

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
        expect(testModel['handlers'][0].itemIndex).toBe(0);
        expect(testModel['handlers'][0].getItem()).toBe(0);
        expect(testModel['handlers'][0].getPosition()).toBe(0);

        expect(testModel['handlers'][1].handlerIndex).toBe(1);
        expect(testModel['handlers'][1].itemIndex).toBe(4);
        expect(testModel['handlers'][1].getItem()).toBe(4);
        expect(testModel['handlers'][1].getPosition()).toBe(0.4);
      });

      test('Ситуация, когда не хватает значений на все хэндлеры', () => {
        testModel['min'] = 0;
        testModel['max'] = 1;
        testModel['step'] = 1;
        testModel['createHandlers']([{ itemIndex: 0 }, { itemIndex: 2 }, { itemIndex: 1 }]);
        expect(testModel['handlers'].length).toBe(2);
      });

      test('Cоздание хэндлеров при наличии пользовательского набора значений', () => {
        testHandlers = [{ itemIndex: 1 }, { itemIndex: 4 }];
        testModel.setItems([1, 'test', 3]);
        testModel['createHandlers'](testHandlers);
        expect(testModel['handlers'][0].handlerIndex).toBe(0);
        expect(testModel['handlers'][0].itemIndex).toBe(1);
        expect(testModel['handlers'][0].getItem()).toBe('test');
        expect(testModel['handlers'][0].getPosition()).toBe(0.5);

        expect(testModel['handlers'][1].handlerIndex).toBe(1);
        expect(testModel['handlers'][1].itemIndex).toBe(2);
        expect(testModel['handlers'][1].getItem()).toBe(3);
        expect(testModel['handlers'][1].getPosition()).toBe(1);
      });
    });

    describe('Создание стандартных хэндлеров', () => {
      let spyCreateHandlers: jest.SpyInstance;

      beforeEach(() => {
        spyCreateHandlers = jest.spyOn(testModel, 'createHandlers');
        testModel['min'] = 0;
        testModel['max'] = 100;
        jest.spyOn(testModel, 'getRange').mockReturnValue(100);
      });

      test('Без пользовательских значений', () => {
        testModel['generateDefaultHandlersItemIndexes'](3);
        expect(spyCreateHandlers).toBeCalledWith(
          [{ itemIndex: 25 }, { itemIndex: 50 }, { itemIndex: 75 }],
        );
      });

      test('С пользовательскими значениями', () => {
        testModel['generateDefaultHandlersItemIndexes'](4, [-1, 66, 208, 22]);
        expect(spyCreateHandlers).toBeCalledWith(
          [{ itemIndex: 0 }, { itemIndex: 66 }, { itemIndex: 100 }, { itemIndex: 22 }],
        );
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
        expect(testModel.checkItemOccupancy(4)).toBeTruthy();

        expect(testModel.checkItemOccupancy(2)).toBeFalsy();
      });
    });
  });

  describe('Обмен данными', () => {
    beforeEach(() => {
      testModel = new SliderModel();
    });

    describe('Получение из модели данных о хэндлерах', () => {
      const testParameters = { handlers: [{ itemIndex: 1 }, { itemIndex: 3 }] };
      beforeEach(() => {
        testModel = new SliderModel(testParameters);
      });

      test(('Пользовательские хэндлеры'), () => {
        expect(testModel.getHandlersData()).toStrictEqual({
          customHandlers: true,
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
        testModel = new SliderModel({ isRange: true });
        expect(testModel.getHandlersData()).toStrictEqual({
          customHandlers: false,
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
      expect(testModel.getSliderData()).toStrictEqual({
        step: testModel['step'] / testModel.getRange(),
        absoluteStep: testModel['step'],
        min: testModel['min'],
        max: testModel['max'],
      });
    });

    describe('Обработка изменения позиции хэндлера', () => {
      let spyGetItemIndexFromPosition: jest.SpyInstance;
      const testData = { index: 0, position: 0.6 };
      let spySetItemIndex: jest.SpyInstance;

      beforeEach(() => {
        spyGetItemIndexFromPosition = jest.spyOn(testModel, 'getItemIndexFromPosition');
        spySetItemIndex = jest.spyOn(testModel['handlers'][testData.index], 'setItemIndex');
      });

      test('Обычная ситуация', () => {
        testModel.handleHandlerPositionChanged(testData);
        expect(spyGetItemIndexFromPosition).toBeCalledWith(testData.position);
        expect(spySetItemIndex).toBeCalledWith(spyGetItemIndexFromPosition.mock.results[0].value);
      });

      test('Если последнее значение не делится ровно на шаг', () => {
        testModel.setStep(3);
        testData.position = 1;

        testModel.handleHandlerPositionChanged(testData);
        expect(spySetItemIndex).toBeCalledWith(10);
      });
    });

    test('Обработчик изменения значения хэндлера', () => {
      const testedHandler = testModel['handlers'][0];

      expect(testModel.handlerValueChanged(testedHandler)).toStrictEqual({
        index: 0, relativeValue: testedHandler.getPosition(), item: testedHandler.getItem(),
      });
    });
  });
});

describe('Функции', () => {
  beforeEach(() => {
    testModel = new SliderModel();
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
      oldMax = testModel.getMax();
      oldMin = testModel.getMin();
    });

    describe('Установка минимума', () => {
      test('Если минимум больше максимума - ничего не происходит', () => {
        newMin = 20;
        testModel.setMin(newMin);
        expect(testModel.getMin()).toBe(oldMin);
      });

      test('Штатная ситуация', () => {
        newMin = 5;
        testModel.setMin(newMin);
        expect(testModel.getMin()).toBe(newMin);
        expect(testModel['handlers'][0].itemIndex).toBeGreaterThanOrEqual(newMin);
      });
    });

    describe('Установка максимума', () => {
      test('Если максимум меньше минимума - ничего не произойдёт', () => {
        newMax = -1;
        testModel.setMax(newMax);
        expect(testModel.getMax()).toBe(oldMax);
      });

      test('Штатная ситуация', () => {
        newMax = 30;
        testModel.setMax(newMax);
        expect(testModel.getMax()).toBe(newMax);
      });
    });

    describe('Установка минимума и максимума', () => {
      test('Если минимум больше максимума - ничего не происходит', () => {
        oldMax = testModel.getMax();
        newMin = 10;
        newMax = 0;
        testModel.setMinMax(newMax, newMin);
        expect(testModel.getMax()).toBe(oldMax);
        expect(testModel.getMin()).toBe(oldMin);
      });

      test('Штатная ситуация', () => {
        newMax = 100;
        testModel.setMinMax(newMin, newMax);
        expect(testModel.getMin()).toBe(newMin);
        expect(testModel.getMax()).toBe(newMax);
      });
    });
  });

  describe('Установка шага значений', () => {
    test('Если переданы пользовательские значения, то шаг округляется', () => {
      testModel.setItems(['']);
      testModel.setStep(2.6);
      expect(testModel['step']).toBe(3);
    });

    test('Если пользовательские значения не переданы, шаг может быть и дробным', () => {
      testModel.setItems(null);
      testModel.setStep(2.6);
      expect(testModel['step']).toBe(2.6);
    });
  });

  describe('Добавление хэндлера', () => {
    let oldHandlers: HandlerModel[];

    beforeEach(() => {
      oldHandlers = [...testModel['handlers']];
    });

    test('Штатная ситуация', () => {
      testModel.addHandler(7);
      expect(testModel['handlers'].pop().itemIndex).toBe(7);
      expect(testModel['handlers']).toStrictEqual(oldHandlers);
    });

    test('Если все значения заняты, ничего не произойдёт', () => {
      testModel.setMinMax(0, 1);
      testModel.setStep(1);
      testModel.addHandler(1);
      oldHandlers = [...testModel['handlers']];
      const functionResult = testModel.addHandler(1);
      expect(testModel['handlers']).toStrictEqual(oldHandlers);
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
