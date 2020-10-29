/* eslint-disable class-methods-use-this,@typescript-eslint/no-empty-function */
import {
  addListenerAfter,
  calculateElementCenter,
  clamp, createButton, createElement, createInput, createLabel,
  parseClassesString,
  removeListener,
  standardize,
} from './functions';
import { Listenable } from '../interfaces';
import { KeyStringObj } from '../types';

describe('Парсинг строки классов', () => {
  test('Передача пустого параметра', () => {
    const testClassString: string = null;
    expect(parseClassesString(testClassString)).toBe(undefined);
  });

  test('передача строки из пробела (не должно быть классов в результате)', () => {
    const testClassString = '  ';
    expect(parseClassesString(testClassString)).toBe(undefined);
  });

  test('передача класса с пробелом', () => {
    const testClassString = '1 ';
    expect(parseClassesString(testClassString)).toStrictEqual(['1']);
  });

  test('передача двух классов с лишним пробелом между ними', () => {
    const testClassString = '1  2';
    expect(parseClassesString(testClassString)).toStrictEqual(['1', '2']);
  });

  test('передача трёх нормальных классов', () => {
    const testClassString = 'test1 test-2 test_3';
    expect(parseClassesString(testClassString)).toStrictEqual(['test1', 'test-2', 'test_3']);
  });
});

describe('Слушатель', () => {
  class TestContext implements Listenable {
        public listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

        testExecutor(): void { }
  }

  let spyTestExecutor: jest.SpyInstance;
  let testListener: jest.Mock;
  let secondTestListener: jest.Mock;
  let testContext: TestContext & KeyStringObj;

  let spyExecutorCalls = 0;
  let testListenerCalls = 0;
  let secondTestListenerCalls = 0;

  function testCalls(): void {
    expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
    expect(testListener).toBeCalledTimes(testListenerCalls);
    expect(secondTestListener).toBeCalledTimes(secondTestListenerCalls);
  }

  beforeAll(() => {
    testContext = new TestContext();
    spyTestExecutor = jest.spyOn(testContext, 'testExecutor');
    testListener = jest.fn();
    secondTestListener = jest.fn();
  });

  beforeEach(() => {
    spyTestExecutor.mockClear();
    testListener.mockClear();
    secondTestListener.mockClear();
    spyExecutorCalls = 0;
    testListenerCalls = 0;
    secondTestListenerCalls = 0;
  });

  describe('Добавление слушателя к функции', () => {
    test('изначально вызывается только функция', () => {
      testContext.testExecutor();
      spyExecutorCalls += 1;
      expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
      expect(testListener).not.toBeCalled();
      expect(secondTestListener).not.toBeCalled();
    });

    test('добавление без передачи контекста (ничего не должно добавиться)', () => {
      addListenerAfter('testExecutor', testListener, null);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
      expect(testListener).not.toBeCalled();
      expect(secondTestListener).not.toBeCalled();
    });

    test('добавление первого слушателя', () => {
      addListenerAfter('testExecutor', testListener, testContext);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
      testListenerCalls += 1;
      expect(testListener).toBeCalledTimes(testListenerCalls);
      expect(secondTestListener).not.toBeCalled();
    });

    test('добавление второго слушателя', () => {
      addListenerAfter('testExecutor', secondTestListener, testContext);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      testListenerCalls += 1;
      secondTestListenerCalls += 1;
      expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
      expect(testListener).toBeCalledTimes(testListenerCalls);
      expect(secondTestListener).toBeCalledTimes(secondTestListenerCalls);
    });
  });

  describe('Удаление слушателя к функции', () => {
    test('без передачи контекста (не должно ничего удалиться)', () => {
      removeListener('testExecutor', testListener, null);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      testListenerCalls += 1;
      secondTestListenerCalls += 1;
      testCalls();
    });

    test('передана функция, которой нет в списке (не должно ничего удалиться)', () => {
      removeListener('testExecutor', (): void => undefined, testContext);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      testListenerCalls += 1;
      secondTestListenerCalls += 1;
      testCalls();
    });

    test('удаление первого слушателя', () => {
      removeListener('testExecutor', testListener, testContext);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      secondTestListenerCalls += 1;
      testCalls();
    });

    test('удаление второго', () => {
      removeListener('testExecutor', secondTestListener, testContext);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
      expect(testListener).toBeCalledTimes(testListenerCalls);
      expect(secondTestListener).toBeCalledTimes(secondTestListenerCalls);
    });
  });
});

describe('Сжимание числа в диапазон', () => {
  test('число в диапазоне', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  test('число меньше минимума', () => {
    expect(clamp(-1, -0.1, 10)).toBe(-0.1);
  });

  test('число больше максимума', () => {
    expect(clamp(123, 0, 10.5)).toBe(10.5);
  });

  test('все аргументы одинаковые', () => {
    expect(clamp(1, 1, 1)).toBe(1);
  });
});

describe('Стандартизация числа по параметрам слайдера', () => {
  test('всё корректно', () => {
    expect(standardize(5, { min: 0, max: 10, stepPart: 1 })).toBe(5);
  });

  test('значение не подходит под шаг', () => {
    expect(standardize(5, { min: 0, max: 10, stepPart: 0.3 })).toBe(5.1);
  });

  test('значение больше максимума', () => {
    expect(standardize(5000, { min: 0, max: 10, stepPart: 1 })).toBe(10);
  });

  test('значение меньше минимума', () => {
    expect(standardize(-5, { min: 0, max: 10, stepPart: 1 })).toBe(0);
  });

  test('проверка на перепутанные минимум и максимум', () => {
    expect(standardize(-5, { min: 10, max: -10, stepPart: 1 })).toBe(-5);
  });
});

describe('Вычисление середины HTML-элемента в необходимой плоскости', () => {
  const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  let testElement: HTMLElement;

  test('нулевой элемент', () => {
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      height: 0, width: 0, x: 0, y: 0, bottom: 0, left: 0, right: 0, top: 0, toJSON: null,
    }));
    testElement = document.createElement('div');
    expect(calculateElementCenter(testElement)).toStrictEqual({ x: 0, y: 0 });
  });

  test('вертикальный', () => {
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      height: 100, width: 0, x: 0, y: 0, bottom: 0, left: 0, right: 0, top: 10, toJSON: null,
    }));
    testElement = document.createElement('div');
    expect(calculateElementCenter(testElement)).toStrictEqual({ x: 0, y: 60 });
  });

  test('горизонтальный', () => {
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      height: 0, width: 50, x: 0, y: 0, bottom: 0, left: 100, right: 0, top: 0, toJSON: null,
    }));
    testElement = document.createElement('div');
    expect(calculateElementCenter(testElement)).toStrictEqual({ x: 125, y: 0 });

    Element.prototype.getBoundingClientRect = origGetBoundingClientRect;
  });
});

describe('Создание элементов', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('Создание произвольного элемента', () => {
    const testElement = createElement('div', 'testClass', document.body);
    expect(document.body.innerHTML).toBe('<div class="testClass"></div>');
    expect(document.querySelector('div.testClass')).toBe(testElement);
  });

  test('Создание лейбла', () => {
    const testLabel = createLabel('test text', 'testClass', document.body);
    expect(document.querySelector('label.testClass')).toBe(testLabel);
    expect(testLabel.innerText).toBe('test text');
  });

  test('Создание поля ввода', () => {
    let testInput = createInput('testClass', document.body);
    expect(document.querySelector('input.testClass')).toBe(testInput);
    expect(testInput.type).not.toBe('checkbox');

    testInput = createInput('testClass2', document.body, true);
    expect(document.querySelector('input.testClass2')).toBe(testInput);
    expect(testInput.type).toBe('checkbox');
  });

  test('Создание кнопки', () => {
    const testButton = createButton('test text', 'testClass', document.body);
    expect(document.querySelector('button.testClass')).toBe(testButton);
    expect(testButton.innerText).toBe('test text');
  });
});
