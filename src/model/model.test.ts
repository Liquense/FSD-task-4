/* eslint-disable dot-notation,no-undef,@typescript-eslint/ban-ts-ignore */
import Model from './model';
import { KeyStringObj } from '../utils/types';

let testModel: Model & KeyStringObj;
const createHandlersFN = '_createHandlers';
const generateDefaultHandlersItemIndexesFN = '_generateDefaultHandlersItemIndexes';


describe('Инициализация', () => {
  test('Конструктор', () => {
    const origSetMinMax = Model.prototype.setMinMax;
    Model.prototype.setMinMax = jest.fn();
    const mockSetMinMax = Model.prototype.setMinMax;

    const origSetStep = Model.prototype.setStep;
    Model.prototype.setStep = jest.fn();
    const mockSetStep = Model.prototype.setStep;

    const origSetItems = Model.prototype.setItems;
    Model.prototype.setItems = jest.fn();
    const mockSetItems = Model.prototype.setItems;

    const origCreateCustomHandlers = Model.prototype[createHandlersFN];
    Model.prototype[createHandlersFN] = jest.fn();
    const mockCreateCustomHandlers = Model.prototype[createHandlersFN];

    const origGenerateDefaultHandlers = Model.prototype[generateDefaultHandlersItemIndexesFN];
    Model.prototype[generateDefaultHandlersItemIndexesFN] = jest.fn();
    const mockGenerateDefaultHandlers = Model.prototype[generateDefaultHandlersItemIndexesFN];

    // создание без передачи параметров
    testModel = new Model();
    expect(mockSetMinMax).toBeCalledWith(undefined);
    expect(mockSetStep).toBeCalledWith(undefined);
    expect(mockSetItems).toBeCalledWith(undefined);
    expect(mockGenerateDefaultHandlers).toBeCalledWith(1, undefined);

    // создание с передачей данных (items) и установкой диапазона
    const testParameters = { isRange: true, max: 100, items: [2, 6, 12] };
    testModel = new Model(testParameters);
    expect(mockSetMinMax).toBeCalledWith(testParameters);
    expect(mockSetStep).toBeCalledWith(testParameters);
    expect(mockSetItems).toBeCalledWith(testParameters.items);
    expect(mockGenerateDefaultHandlers).toBeCalledWith(2, undefined);

    const testParameters2 = { isRange: true, max: 100, values: [2, 6, 10] };
    testModel = new Model(testParameters2);
    expect(mockSetMinMax).toBeCalledWith(testParameters2);
    expect(mockSetStep).toBeCalledWith(testParameters2);
    expect(mockSetItems).toBeCalledWith(undefined);
    expect(mockGenerateDefaultHandlers).toBeCalledWith(2, testParameters2.values);

    // с передачей своих значений хэндлеров
    const testParameters3 = { handlers: [{ itemIndex: 1 }, { itemIndex: 3 }] };
    testModel = new Model(testParameters3);
    expect(mockSetMinMax).toBeCalledWith(testParameters3);
    expect(mockSetStep).toBeCalledWith(testParameters3);
    expect(mockSetItems).toBeCalledWith(undefined);
    expect(mockCreateCustomHandlers).toBeCalledWith(testParameters3.handlers);

    Model.prototype.setMinMax = origSetMinMax;
    Model.prototype.setStep = origSetStep;
    Model.prototype.setItems = origSetItems;
    Model.prototype[createHandlersFN] = origCreateCustomHandlers;
    Model.prototype[generateDefaultHandlersItemIndexesFN] = origGenerateDefaultHandlers;
  });

  describe('Установка полей', () => {
    beforeEach(() => {
      testModel = new Model();
    });

    test('Создание хэндлеров с пользовательскими значениями', () => {
      const prevHandlers = testModel['_handlers'];
      let testHandlers = [{ itemIndex: 0 }, { itemIndex: 4 }];
      testModel.setItems(null);

      // При передаче значения, приводимого к false или пустого массива, функция не выполняется
      testModel[createHandlersFN](null);
      expect(testModel['_handlers']).toBe(prevHandlers);

      testModel[createHandlersFN]([]);
      expect(testModel['_handlers']).toBe(prevHandlers);

      // создание хэндлеров без пользовательского набора значений
      testModel[createHandlersFN](testHandlers);
      expect(testModel['_handlers'][0].handlerIndex).toBe(0);
      expect(testModel['_handlers'][0].itemIndex).toBe(0);
      expect(testModel['_handlers'][0].item).toBe(0);
      expect(testModel['_handlers'][0].position).toBe(0);

      expect(testModel['_handlers'][1].handlerIndex).toBe(1);
      expect(testModel['_handlers'][1].itemIndex).toBe(4);
      expect(testModel['_handlers'][1].item).toBe(4);
      expect(testModel['_handlers'][1].position).toBe(0.4);
      // ситуация, когда не хватает значений на все хэндлеры
      testModel['_min'] = 0;
      testModel['_max'] = 1;
      testModel['_step'] = 1;
      testModel[createHandlersFN]([{ itemIndex: 0 }, { itemIndex: 2 }, { itemIndex: 1 }]);
      expect(testModel['_handlers'].length).toBe(2);

      // создание хэндлеров при наличии пользовательского набора значений
      testHandlers = [{ itemIndex: 1 }, { itemIndex: 4 }];
      testModel.setItems([1, 'test', 3]);
      testModel[createHandlersFN](testHandlers);
      expect(testModel['_handlers'][0].handlerIndex).toBe(0);
      expect(testModel['_handlers'][0].itemIndex).toBe(1);
      expect(testModel['_handlers'][0].item).toBe('test');
      expect(testModel['_handlers'][0].position).toBe(0.5);

      expect(testModel['_handlers'][1].handlerIndex).toBe(1);
      expect(testModel['_handlers'][1].itemIndex).toBe(2);
      expect(testModel['_handlers'][1].item).toBe(3);
      expect(testModel['_handlers'][1].position).toBe(1);
    });

    test('Создание стандартных хэндлеров', () => {
      testModel['_min'] = 0;
      testModel['_max'] = 100;
      jest.spyOn(testModel, 'range', 'get').mockReturnValue(100);
      // @ts-ignore
      const spyCreateHandlers = jest.spyOn(testModel, createHandlersFN).mockImplementationOnce();

      // без пользовательских значений
      testModel[generateDefaultHandlersItemIndexesFN](3);
      expect(spyCreateHandlers).toBeCalledWith(
        [{ itemIndex: 25 }, { itemIndex: 50 }, { itemIndex: 75 }],
      );
      // с пользовательскими значениями
      testModel[generateDefaultHandlersItemIndexesFN](4, [-1, 66, 208, 22]);
      expect(spyCreateHandlers).toBeCalledWith(
        [{ itemIndex: 0 }, { itemIndex: 66 }, { itemIndex: 100 }, { itemIndex: 22 }],
      );
    });

    describe('Занятие и освобождение значений', () => {
      beforeEach(() => {
        testModel = new Model();
      });

      test('Занятие значения', () => {
        const oldOccupiedItems = testModel['_occupiedItems'];

        testModel.occupyItem(4, 0);
        oldOccupiedItems[4] = 0;
        expect(testModel['_occupiedItems']).toStrictEqual(oldOccupiedItems);
      });

      test('Освобождение значения', () => {
        const oldOccupiedItems = testModel['_occupiedItems'];

        testModel['_occupiedItems'][4] = 0;
        testModel.releaseItem(4);
        expect(testModel['_occupiedItems']).toStrictEqual(oldOccupiedItems);
      });

      test('Проверка занятости значения', () => {
        testModel['_occupiedItems'][4] = 0;
        expect(testModel.checkItemOccupancy(4)).toBeTruthy();

        expect(testModel.checkItemOccupancy(2)).toBeFalsy();
      });
    });
  });

  describe('Обмен данными', () => {
    beforeEach(() => {
      testModel = new Model();
    });

    test('Получение из модели данных о хэндлерах', () => {
      // пользовательские хэндлеры
      const testParameters = { handlers: [{ itemIndex: 1 }, { itemIndex: 3 }] };
      testModel = new Model(testParameters);

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
      // стандартные хэндлеры
      testModel = new Model({ isRange: true });
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

    test('Получение из модели данных для слайдера', () => {
      expect(testModel.getSliderData()).toStrictEqual({
        step: testModel['_step'] / testModel.range,
        absoluteStep: testModel['_step'],
        min: testModel['_min'],
        max: testModel['_max'],
      });
    });

    test('Обработка изменения позиции хэндлера', () => {
      // @ts-ignore
      const spyGetItemIndexFromPosition = jest.spyOn(testModel, '_getItemIndexFromPosition');
      const testData = { index: 0, position: 0.6 };
      const spySetItemIndex = jest.spyOn(testModel['_handlers'][testData.index], 'setItemIndex');

      // обычная ситуация
      testModel.handleHandlerPositionChanged(testData);
      expect(spyGetItemIndexFromPosition).toBeCalledWith(testData.position);
      expect(spySetItemIndex).toBeCalledWith(spyGetItemIndexFromPosition.mock.results[0].value);

      // если последнее значение не делится ровно на шаг
      testModel.setMinMax({ min: 0, max: 10 });
      testModel.setStep({ step: 3 });
      testData.position = 1;
      // несмотря на то, что 10 ближе к 9 (и округление по шагу должно быть в сторону 9),
      // при перемещении хэндлера на крайнюю позицию значение не округляется
      // (и соответственно сохраняется максимальное)
      testModel.handleHandlerPositionChanged(testData);
      expect(spySetItemIndex).toBeCalledWith(10);
    });

    test('Обработчик изменения значения хэндлера', () => {
      const testedHandler = testModel['_handlers'][0];

      expect(testModel.handlerValueChanged(testedHandler)).toStrictEqual({
        index: 0, relativeValue: testedHandler.position, item: testedHandler.item,
      });
    });
  });
});

describe('Функции', () => {
  beforeEach(() => {
    testModel = new Model();
  });

  test('Установка набора пользовательских значений', () => {
    const testItems = [1, 'test', 3];
    // с передачей пустого параметра должен установиться null
    testModel.setItems(null);
    expect(testModel['_items']).toBe(null);

    // c передачей массива любых значений - оно и передаётся
    testModel.setItems(testItems);
    expect(testModel['_items']).toBe(testItems);
  });

  test('Установка минимальных и максимальных значений', () => {
    let oldMax = testModel.max;
    let oldMin = testModel.min;
    // проверяем исходные данные
    testModel.setMinMax();
    expect(testModel.max).toBe(oldMax);
    expect(testModel.min).toBe(oldMin);

    // устанавливаем только минимум
    // если минимум меньше старого максимума - ничего не происходит
    let newMin = 20; let
      newMax: number;
    testModel.setMinMax({ min: newMin });
    expect(testModel.min).toBe(oldMin);
    expect(testModel.max).toBe(oldMax);
    // если всё в порядке - должен поменяться минимум у модели
    newMin = 5;
    testModel.setMinMax({ min: newMin });
    expect(testModel.min).toBe(newMin);
    expect(testModel.max).toBe(oldMax);
    expect(testModel['_handlers'][0].itemIndex).toBeGreaterThanOrEqual(newMin); // после установки минимума или максимума пересчитывается и положение хэндлеров

    // устанавливаем только максимум
    // если максимум меньше старого минимума - ничего не произойдёт
    oldMin = newMin;
    newMax = 0;
    testModel.setMinMax({ max: newMax });
    expect(testModel.min).toBe(oldMin);
    expect(testModel.max).toBe(oldMax);
    // если всё в порядке - меняется максимум у модели
    newMax = 30;
    testModel.setMinMax({ max: newMax });
    expect(testModel.min).toBe(oldMin);
    expect(testModel.max).toBe(newMax);

    // устанавливаем минимум и максимум
    // Если минимум больше максимума - ничего не происходит
    oldMax = newMax;
    newMin = 10;
    newMax = 0;
    testModel.setMinMax({ max: newMax, min: newMin });
    expect(testModel.max).toBe(oldMax);
    expect(testModel.min).toBe(oldMin);
    // если всё нормально - меняются оба значения
    newMax = 100;
    testModel.setMinMax({ min: newMin, max: newMax });
    expect(testModel.min).toBe(newMin);
    expect(testModel.max).toBe(newMax);
  });

  test('Установка шага значений', () => {
    const oldStep = testModel['_step'];
    // если ничего не передано - ничего не меняется
    testModel.setStep();
    expect(testModel['_step']).toBe(oldStep);

    // если переданы пользовательские значения, то шаг округляется
    const testItems = [1, 'test', 3];
    testModel.setStep({ step: 2.6, items: testItems });
    expect(testModel['_step']).toBe(3);

    // если пользовательские значения не переданы, шаг может быть и дробным
    testModel.setStep({ step: 2.6 });
    expect(testModel['_step']).toBe(2.6);
  });

  test('Добавление хэндлера', () => {
    let oldHandlers = [...testModel['_handlers']];

    // если всё в порядке
    testModel.addHandler(7);
    expect(testModel['_handlers'].pop().itemIndex).toBe(7); // у нового хэндлера нужное нам значение
    expect(testModel['_handlers']).toStrictEqual(oldHandlers); // если его убрать (.pop() выше), то будет старый набор хэндлеров

    // если все значения заняты
    testModel.setMinMax({ min: 0, max: 1 });
    testModel.setStep({ step: 1 });
    testModel.addHandler(1); // на этот хэндлер места хватит
    oldHandlers = [...testModel['_handlers']];
    const functionResult = testModel.addHandler(1); // а на этот - нет
    expect(testModel['_handlers']).toStrictEqual(oldHandlers);
    expect(functionResult).toBe(null); // при неудачной вставке должен возвращаться null
  });

  test('Удаление хэндлера', () => {
    testModel.addHandler(7);
    testModel.addHandler(8);
    testModel.addHandler(9);
    let oldHandlers = [...testModel['_handlers']];

    // если такой хэндлер есть
    let removingIndex = 1;
    expect(testModel['_handlers'].some((handler) => handler.handlerIndex === removingIndex)).toBeTruthy(); // проверяем, что данный хэндлер есть до удаления
    let removingResult = testModel.removeHandler(removingIndex);
    expect(testModel['_handlers'].length === oldHandlers.length - 1).toBeTruthy();
    expect(testModel['_handlers'].some((handler) => handler.handlerIndex === removingIndex)).toBeFalsy(); // проверяем, что после удаления хэндлер пропал
    expect(removingResult).toBeTruthy();

    // если хэндлера с таким индексом нет
    oldHandlers = [...testModel['_handlers']];
    removingIndex = 111;
    expect(testModel['_handlers'].some((handler) => handler.handlerIndex === removingIndex)).toBeFalsy(); // проверяем, что данный хэндлер есть до удаления
    removingResult = testModel.removeHandler(removingIndex);
    expect(testModel['_handlers'].length === oldHandlers.length).toBeTruthy(); // длина массива хэндлеров остаётся прежней
    expect(removingResult).toBeFalsy(); // функция возвращает false, если хэндлер не найден
  });
});
