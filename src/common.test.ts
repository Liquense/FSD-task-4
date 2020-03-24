import {
    addListenerAfter,
    calculateElementCenter,
    clamp,
    Listenable,
    parseClassesString,
    removeListener,
    standardize
} from "./common";
import {returnStatement} from "@babel/types";

test("Парсинг строки классов", () => {
    //передача пустого параметра
    let testClassString = null;
    expect(parseClassesString(testClassString)).toBe(undefined);

    //передача строки из пробела (не должно быть классов в результате)
    testClassString = "  ";
    expect(parseClassesString(testClassString)).toBe(undefined);

    //передача класса с пробелом
    testClassString = "1 ";
    expect(parseClassesString(testClassString)).toStrictEqual(["1"]);

    //передача двух классов с лишним пробелом между ними
    testClassString = "1  2";
    expect(parseClassesString(testClassString)).toStrictEqual(["1", "2"]);

    //передача трёх нормальных классов
    testClassString = "test1 test-2 test_3";
    expect(parseClassesString(testClassString)).toStrictEqual(["test1", "test-2", "test_3"]);
});

describe("Слушатель", () => {
    let spyTestExecutor,
        testListener,
        testListener2;
    let testContext;
    beforeAll(() => {
        class TestContext implements Listenable {
            public listenDictionary: { function: Function, listeners: Function[] };

            testExecutor = function () {
            };
        }

        testContext = new TestContext();
        spyTestExecutor = jest.spyOn(testContext, "testExecutor");
        testListener = jest.fn(() => {
        });
        testListener2 = jest.fn(() => {
        });
    });

    beforeEach(() => {
        spyTestExecutor.mockClear();
        testListener.mockClear();
        testListener2.mockClear();
    });

    test("Добавление слушателя к функции", () => {
        let steCount = 0, tlCount = 0, tl2Count = 0;

        //изначально вызывается только функция
        testContext.testExecutor();
        expect(spyTestExecutor).toBeCalledTimes(++steCount);
        expect(testListener).not.toBeCalled();
        expect(testListener2).not.toBeCalled();

        //добавление без передачи контекста (ничего не должно добавиться)
        addListenerAfter("testExecutor", testListener, null);
        testContext.testExecutor();
        expect(spyTestExecutor).toBeCalledTimes(++steCount);
        expect(testListener).not.toBeCalled();
        expect(testListener2).not.toBeCalled();

        //добавление первого слушателя
        addListenerAfter("testExecutor", testListener, testContext);
        testContext.testExecutor();
        expect(spyTestExecutor).toBeCalledTimes(++steCount);
        expect(testListener).toBeCalledTimes(++tlCount);
        expect(testListener2).not.toBeCalled();

        //добавление второго слушателя
        addListenerAfter("testExecutor", testListener2, testContext);
        testContext.testExecutor();
        expect(spyTestExecutor).toBeCalledTimes(++steCount);
        expect(testListener).toBeCalledTimes(++tlCount);
        expect(testListener2).toBeCalledTimes(++tl2Count);
    });

    test("Удаление слушателя к функции", () => {
        let steCount = 0, tlCount = 0, tl2Count = 0;

        //без передачи контекста (не должно ничего удалиться)
        removeListener("testExecutor", testListener, null);
        testContext.testExecutor();
        expect(spyTestExecutor).toBeCalledTimes(++steCount);
        expect(testListener).toBeCalledTimes(++tlCount);
        expect(testListener2).toBeCalledTimes(++tl2Count);

        //передана функция, которой нет в списке (не должно ничего удалиться)
        removeListener("testExecutor", () => {}, testContext);
        testContext.testExecutor();
        expect(spyTestExecutor).toBeCalledTimes(++steCount);
        expect(testListener).toBeCalledTimes(++tlCount);
        expect(testListener2).toBeCalledTimes(++tl2Count);

        //удалние первого слушателя
        removeListener("testExecutor", testListener, testContext);
        testContext.testExecutor();
        expect(spyTestExecutor).toBeCalledTimes(++steCount);
        expect(testListener).toBeCalledTimes(tlCount);
        expect(testListener2).toBeCalledTimes(++tl2Count);

        //удаление второго
        removeListener("testExecutor", testListener2, testContext);
        testContext.testExecutor();
        expect(spyTestExecutor).toBeCalledTimes(++steCount);
        expect(testListener).toBeCalledTimes(tlCount);
        expect(testListener2).toBeCalledTimes(tl2Count);
    });
});

test("Сжимание числа в диапазон", () => {
    expect(clamp(5, 0, 10)).toBe(5); //в диапазоне
    expect(clamp(-1, -0.1, 10)).toBe(-0.1); //меньше минимума
    expect(clamp(123, 0, 10.5)).toBe(10.5); //больше максимума
    expect(clamp(1, 1, 1)).toBe(1); //всё одинаково
});

test("Стандартизация числа по параметрам слайдера", () => {
    expect(standardize(5, {min: 0, max: 10, step: 1})).toBe(5); //всё верно
    expect(standardize(5, {min: 0, max: 10, step: 0.3})).toBe(5.1); //не подходит под шаг
    expect(standardize(5000, {min: 0, max: 10, step: 1})).toBe(10); //больше максимума
    expect(standardize(-5, {min: 0, max: 10, step: 1})).toBe(0); //меньше минимума
    expect(standardize(-5, {min: 10, max: -10, step: 1})).toBe(-5); //проверка на перепутанные минимум и максимум
});

test("Вычисление середины HTML-элемента в необходимой плоскости", () => {
    //нулевой элемент
    Element.prototype.getBoundingClientRect = jest.fn(() => {
        return {height: 0, width: 0, x: 0, y: 0, bottom: 0, left: 0, right: 0, top: 0, toJSON: null};
        }
    );
    let testElement = document.createElement("div");
    expect(calculateElementCenter(testElement, true)).toBe(0);

    //вертикальный
    Element.prototype.getBoundingClientRect = jest.fn(() => {
            return {height: 100, width: 0, x: 0, y: 0, bottom: 0, left: 0, right: 0, top: 10, toJSON: null};
        }
    );
    testElement = document.createElement("div");
    expect(calculateElementCenter(testElement, true)).toBe(60);

    //горизонтальный
    Element.prototype.getBoundingClientRect = jest.fn(() => {
            return {height: 0, width: 50, x: 0, y: 0, bottom: 0, left: 100, right: 0, top: 0, toJSON: null};
        }
    );
    testElement = document.createElement("div");
    expect(calculateElementCenter(testElement, false)).toBe(125);
});
