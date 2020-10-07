/* eslint-disable dot-notation,no-undef,@typescript-eslint/ban-ts-ignore */
import { KeyStringObj } from '../utils/interfacesAndTypes';

import SliderModel from './sliderModel';

let testModel: SliderModel & KeyStringObj;
const createHandlersFN = 'createHandlers';
const generateDefaultHandlersItemIndexesFN = 'generateDefaultHandlersItemIndexes';


describe('Инициализация', () => {
  test('Конструктор', () => {
    const origSetMinMax = SliderModel.prototype.setMinMax;
    SliderModel.prototype.setMinMax = jest.fn();
    const mockSetMinMax = SliderModel.prototype.setMinMax;

    const origSetStep = SliderModel.prototype.setStep;
    SliderModel.prototype.setStep = jest.fn();
    const mockSetStep = SliderModel.prototype.setStep;

    const origSetItems = SliderModel.prototype.setItems;
    SliderModel.prototype.setItems = jest.fn();
    const mockSetItems = SliderModel.prototype.setItems;

    const origCreateCustomHandlers = SliderModel.prototype[createHandlersFN];
    SliderModel.prototype[createHandlersFN] = jest.fn();
    const mockCreateCustomHandlers = SliderModel.prototype[createHandlersFN];

    const origGenerateDefaultHandlers = SliderModel.prototype[generateDefaultHandlersItemIndexesFN];
    SliderModel.prototype[generateDefaultHandlersItemIndexesFN] = jest.fn();
    const mockGenerateDefaultHandlers = SliderModel.prototype[generateDefaultHandlersItemIndexesFN];

    // создание без передачи параметров
    testModel = new SliderModel();
    expect(mockSetMinMax).toBeCalledWith(undefined);
    expect(mockSetStep).toBeCalledWith(undefined);
    expect(mockSetItems).toBeCalledWith(undefined);
    expect(mockGenerateDefaultHandlers).toBeCalledWith(1, undefined);

    // создание с передачей данных (items) и установкой диапазона
    const testParameters = { isRange: true, max: 100, items: [2, 6, 12] };
    testModel = new SliderModel(testParameters);
    expect(mockSetMinMax).toBeCalledWith(testParameters);
    expect(mockSetStep).toBeCalledWith(testParameters);
    expect(mockSetItems).toBeCalledWith(testParameters.items);
    expect(mockGenerateDefaultHandlers).toBeCalledWith(2, undefined);

    const testParameters2 = { isRange: true, max: 100, values: [2, 6, 10] };
    testModel = new SliderModel(testParameters2);
    expect(mockSetMinMax).toBeCalledWith(testParameters2);
    expect(mockSetStep).toBeCalledWith(testParameters2);
    expect(mockSetItems).toBeCalledWith(undefined);
    expect(mockGenerateDefaultHandlers).toBeCalledWith(2, testParameters2.values);

    // с передачей своих значений хэндлеров
    const testParameters3 = { handlers: [{ itemIndex: 1 }, { itemIndex: 3 }] };
    testModel = new SliderModel(testParameters3);
    expect(mockSetMinMax).toBeCalledWith(testParameters3);
    expect(mockSetStep).toBeCalledWith(testParameters3);
    expect(mockSetItems).toBeCalledWith(undefined);
    expect(mockCreateCustomHandlers).toBeCalledWith(testParameters3.handlers);

    SliderModel.prototype.setMinMax = origSetMinMax;
    SliderModel.prototype.setStep = origSetStep;
    SliderModel.prototype.setItems = origSetItems;
    SliderModel.prototype[createHandlersFN] = origCreateCustomHandlers;
    SliderModel.prototype[generateDefaultHandlersItemIndexesFN] = origGenerateDefaultHandlers;
  });

  describe('Установка полей', () => {
    beforeEach(() => {
      testModel = new SliderModel();
    });

    test('Создание хэндлеров с пользовательскими значениями', () => {
      const prevHandlers = testModel['handlers'];
      let testHandlers = [{ itemIndex: 0 }, { itemIndex: 4 }];
      testModel.setItems(null);

      // При передаче значения, приводимого к false или пустого массива, функция не выполняется
      testModel[createHandlersFN](null);
      expect(testModel['handlers']).toBe(prevHandlers);

      testModel[createHandlersFN]([]);
      expect(testModel['handlers']).toBe(prevHandlers);

      // создание хэндлеров без пользовательского набора значений
      testModel[createHandlersFN](testHandlers);
      expect(testModel['handlers'][0].handlerIndex).toBe(0);
      expect(testModel['handlers'][0].itemIndex).toBe(0);
      expect(testModel['handlers'][0].getItem()).toBe(0);
      expect(testModel['handlers'][0].getPosition()).toBe(0);

      expect(testModel['handlers'][1].handlerIndex).toBe(1);
      expect(testModel['handlers'][1].itemIndex).toBe(4);
      expect(testModel['handlers'][1].getItem()).toBe(4);
      expect(testModel['handlers'][1].getPosition()).toBe(0.4);
      // ситуация, когда не хватает значений на все хэндлеры
      testModel['min'] = 0;
      testModel['max'] = 1;
      testModel['step'] = 1;
      testModel[createHandlersFN]([{ itemIndex: 0 }, { itemIndex: 2 }, { itemIndex: 1 }]);
      expect(testModel['handlers'].length).toBe(2);

      // создание хэндлеров при наличии пользовательского набора значений
      testHandlers = [{ itemIndex: 1 }, { itemIndex: 4 }];
      testModel.setItems([1, 'test', 3]);
      testModel[createHandlersFN](testHandlers);
      expect(testModel['handlers'][0].handlerIndex).toBe(0);
      expect(testModel['handlers'][0].itemIndex).toBe(1);
      expect(testModel['handlers'][0].getItem()).toBe('test');
      expect(testModel['handlers'][0].getPosition()).toBe(0.5);

      expect(testModel['handlers'][1].handlerIndex).toBe(1);
      expect(testModel['handlers'][1].itemIndex).toBe(2);
      expect(testModel['handlers'][1].getItem()).toBe(3);
      expect(testModel['handlers'][1].getPosition()).toBe(1);
    });

    test('Создание стандартных хэндлеров', () => {
      testModel['min'] = 0;
      testModel['max'] = 100;
      jest.spyOn(testModel, 'getRange').mockReturnValue(100);
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

    test('Получение из модели данных о хэндлерах', () => {
      // пользовательские хэндлеры
      const testParameters = { handlers: [{ itemIndex: 1 }, { itemIndex: 3 }] };
      testModel = new SliderModel(testParameters);

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

    test('Получение из модели данных для слайдера', () => {
      expect(testModel.getSliderData()).toStrictEqual({
        step: testModel['step'] / testModel.getRange(),
        absoluteStep: testModel['step'],
        min: testModel['min'],
        max: testModel['max'],
      });
    });

    test('Обработка изменения позиции хэндлера', () => {
      // @ts-ignore
      const spyGetItemIndexFromPosition = jest.spyOn(testModel, 'getItemIndexFromPosition');
      const testData = { index: 0, position: 0.6 };
      const spySetItemIndex = jest.spyOn(testModel['handlers'][testData.index], 'setItemIndex');

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
    // с передачей пустого параметра должен установиться null
    testModel.setItems(null);
    expect(testModel['items']).toBe(null);

    // c передачей массива любых значений - оно и передаётся
    testModel.setItems(testItems);
    expect(testModel['items']).toBe(testItems);
  });

  test('Установка минимальных и максимальных значений', () => {
    let oldMax = testModel.getMax();
    let oldMin = testModel.getMin();
    // проверяем исходные данные
    testModel.setMinMax();
    expect(testModel.getMax()).toBe(oldMax);
    expect(testModel.getMin()).toBe(oldMin);

    // устанавливаем только минимум
    // если минимум меньше старого максимума - ничего не происходит
    let newMin = 20; let
      newMax: number;
    testModel.setMinMax({ min: newMin });
    expect(testModel.getMin()).toBe(oldMin);
    expect(testModel.getMax()).toBe(oldMax);
    // если всё в порядке - должен поменяться минимум у модели
    newMin = 5;
    testModel.setMinMax({ min: newMin });
    expect(testModel.getMin()).toBe(newMin);
    expect(testModel.getMax()).toBe(oldMax);
    expect(testModel['handlers'][0].itemIndex).toBeGreaterThanOrEqual(newMin); // после установки минимума или максимума пересчитывается и положение хэндлеров

    // устанавливаем только максимум
    // если максимум меньше старого минимума - ничего не произойдёт
    oldMin = newMin;
    newMax = 0;
    testModel.setMinMax({ max: newMax });
    expect(testModel.getMin()).toBe(oldMin);
    expect(testModel.getMax()).toBe(oldMax);
    // если всё в порядке - меняется максимум у модели
    newMax = 30;
    testModel.setMinMax({ max: newMax });
    expect(testModel.getMin()).toBe(oldMin);
    expect(testModel.getMax()).toBe(newMax);

    // устанавливаем минимум и максимум
    // Если минимум больше максимума - ничего не происходит
    oldMax = newMax;
    newMin = 10;
    newMax = 0;
    testModel.setMinMax({ max: newMax, min: newMin });
    expect(testModel.getMax()).toBe(oldMax);
    expect(testModel.getMin()).toBe(oldMin);
    // если всё нормально - меняются оба значения
    newMax = 100;
    testModel.setMinMax({ min: newMin, max: newMax });
    expect(testModel.getMin()).toBe(newMin);
    expect(testModel.getMax()).toBe(newMax);
  });

  test('Установка шага значений', () => {
    const oldStep = testModel['step'];
    // если ничего не передано - ничего не меняется
    testModel.setStep();
    expect(testModel['step']).toBe(oldStep);

    // если переданы пользовательские значения, то шаг округляется
    const testItems = [1, 'test', 3];
    testModel.setStep({ step: 2.6, items: testItems });
    expect(testModel['step']).toBe(3);

    // если пользовательские значения не переданы, шаг может быть и дробным
    testModel.setStep({ step: 2.6 });
    expect(testModel['step']).toBe(2.6);
  });

  test('Добавление хэндлера', () => {
    let oldHandlers = [...testModel['handlers']];

    // если всё в порядке
    testModel.addHandler(7);
    expect(testModel['handlers'].pop().itemIndex).toBe(7); // у нового хэндлера нужное нам значение
    expect(testModel['handlers']).toStrictEqual(oldHandlers); // если его убрать (.pop() выше), то будет старый набор хэндлеров

    // если все значения заняты
    testModel.setMinMax({ min: 0, max: 1 });
    testModel.setStep({ step: 1 });
    testModel.addHandler(1); // на этот хэндлер места хватит
    oldHandlers = [...testModel['handlers']];
    const functionResult = testModel.addHandler(1); // а на этот - нет
    expect(testModel['handlers']).toStrictEqual(oldHandlers);
    expect(functionResult).toBe(null); // при неудачной вставке должен возвращаться null
  });

  test('Удаление хэндлера', () => {
    testModel.addHandler(7);
    testModel.addHandler(8);
    testModel.addHandler(9);
    let oldHandlers = [...testModel['handlers']];

    // если такой хэндлер есть
    let removingIndex = 1;
    expect(testModel['handlers'].some((handler) => handler.handlerIndex === removingIndex)).toBeTruthy(); // проверяем, что данный хэндлер есть до удаления
    let removingResult = testModel.removeHandler(removingIndex);
    expect(testModel['handlers'].length === oldHandlers.length - 1).toBeTruthy();
    expect(testModel['handlers'].some((handler) => handler.handlerIndex === removingIndex)).toBeFalsy(); // проверяем, что после удаления хэндлер пропал
    expect(removingResult).toBeTruthy();

    // если хэндлера с таким индексом нет
    oldHandlers = [...testModel['handlers']];
    removingIndex = 111;
    expect(testModel['handlers'].some((handler) => handler.handlerIndex === removingIndex)).toBeFalsy(); // проверяем, что данный хэндлер есть до удаления
    removingResult = testModel.removeHandler(removingIndex);
    expect(testModel['handlers'].length === oldHandlers.length).toBeTruthy(); // длина массива хэндлеров остаётся прежней
    expect(removingResult).toBeFalsy(); // функция возвращает false, если хэндлер не найден
  });
});
