/* eslint-disable class-methods-use-this,@typescript-eslint/no-empty-function */
import {
  calculateElementCenter,
  clamp,
  parseClassesString,
  standardize,
} from './functions';

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
    expect(standardize(5, { min: 0, max: 10, step: 1 })).toBe(5);
  });

  test('значение не подходит под шаг', () => {
    expect(standardize(5, { min: 0, max: 10, step: 0.3 })).toBe(5.1);
  });

  test('значение больше максимума', () => {
    expect(standardize(5000, { min: 0, max: 10, step: 1 })).toBe(10);
  });

  test('значение меньше минимума', () => {
    expect(standardize(-5, { min: 0, max: 10, step: 1 })).toBe(0);
  });

  test('проверка на перепутанные минимум и максимум', () => {
    expect(standardize(-5, { min: 10, max: -10, step: 1 })).toBe(-5);
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
