import Model from "./model";
import handlerModel from "./handlerModel";

jest.mock("./controller");

let testModel: Model;
const createHandlersFN = "_createHandlers",
    generateDefaultHandlersItemIndexesFN = "_generateDefaultHandlersItemIndexes";


describe("Инициализация", () => {
    test("Конструктор", () => {
        const origSetMinMax = Model.prototype["_setMinMax"];
        const mockSetMinMax = Model.prototype["_setMinMax"] = jest.fn();

        const origSetStep = Model.prototype["_setStep"];
        const mockSetStep = Model.prototype["_setStep"] = jest.fn();

        const origSetItems = Model.prototype.setItems;
        const mockSetItems = Model.prototype.setItems = jest.fn();

        const origCreateCustomHandlers = Model.prototype[createHandlersFN];
        const mockCreateCustomHandlers = Model.prototype[createHandlersFN] = jest.fn();

        const origGenerateDefaultHandlers = Model.prototype[generateDefaultHandlersItemIndexesFN];
        const mockGenerateDefaultHandlers = Model.prototype[generateDefaultHandlersItemIndexesFN] = jest.fn();

        //создание без передачи параметров
        testModel = new Model();
        expect(mockSetMinMax).toBeCalledWith(undefined);
        expect(mockSetStep).toBeCalledWith(undefined);
        expect(mockSetItems).toBeCalledWith(undefined);
        expect(mockGenerateDefaultHandlers).toBeCalledWith(1, undefined);

        //создание с передачей данных (items) и установкой диапазона
        const testParameters = {isRange: true, max: 100, items: [2, 6, 12]};
        testModel = new Model(testParameters);
        expect(mockSetMinMax).toBeCalledWith(testParameters);
        expect(mockSetStep).toBeCalledWith(testParameters);
        expect(mockSetItems).toBeCalledWith(testParameters.items);
        expect(mockGenerateDefaultHandlers).toBeCalledWith(2, undefined);

        const testParameters2 = {isRange: true, max: 100, values: [2, 6, 10]};
        testModel = new Model(testParameters2);
        expect(mockSetMinMax).toBeCalledWith(testParameters2);
        expect(mockSetStep).toBeCalledWith(testParameters2);
        expect(mockSetItems).toBeCalledWith(undefined);
        expect(mockGenerateDefaultHandlers).toBeCalledWith(2, testParameters2.values);

        //с передачей своих значений хэндлеров
        const testParameters3 = {handlers: [{value: 1}, {value: 3}]};
        testModel = new Model(testParameters3);
        expect(mockSetMinMax).toBeCalledWith(testParameters3);
        expect(mockSetStep).toBeCalledWith(testParameters3);
        expect(mockSetItems).toBeCalledWith(undefined);
        expect(mockCreateCustomHandlers).toBeCalledWith(testParameters3.handlers);

        Model.prototype["_setMinMax"] = origSetMinMax;
        Model.prototype["_setStep"] = origSetStep;
        Model.prototype.setItems = origSetItems;
        Model.prototype[createHandlersFN] = origCreateCustomHandlers;
        Model.prototype[generateDefaultHandlersItemIndexesFN] = origGenerateDefaultHandlers;
    });

    describe("Установка полей", () => {
        beforeEach(() => {
            testModel = new Model();
        });

        test("Установка минимальных и максимальных значений", () => {
            let oldMax = testModel.max,
                oldMin = testModel.min;
            //проверяем исходные данные
            testModel["_setMinMax"]();
            expect(testModel.max).toBe(oldMax);
            expect(testModel.min).toBe(oldMin);

            //устанавливаем только минимум
            let newMin = 20, newMax = 100;
            testModel["_setMinMax"]({min: newMin});
            expect(testModel.max).toBe(oldMax);
            expect(testModel.min).toBe(newMin);

            //устанавливаем только максимум
            testModel["_setMinMax"]({max: newMax});
            expect(testModel.max).toBe(newMax);
            expect(testModel.min).toBe(newMin);

            //устанавливаем минимум и максимум
            testModel["_setMinMax"]({max: oldMax, min: oldMin});
            expect(testModel.max).toBe(oldMax);
            expect(testModel.min).toBe(oldMin);

            //передаём набор своих значений
            const testItems = [1, "test", 3];
            testModel["_setMinMax"]({items: testItems});
            expect(testModel.max).toBe(2);
            expect(testModel.min).toBe(0);
        });

        test("Установка шага значений", () => {
            let oldStep = testModel["_step"];
            //если ничего не передано - ничего не меняется
            testModel["_setStep"]();
            expect(testModel["_step"]).toBe(oldStep);

            //если переданы пользовательские значения, то шаг округляется
            const testItems = [1, "test", 3];
            testModel["_setStep"]({step: 2.6, items: testItems});
            expect(testModel["_step"]).toBe(3);

            //если пользовательские значения не переданы, шаг может быть и дробным
            testModel["_setStep"]({step: 2.6});
            expect(testModel["_step"]).toBe(2.6);
        });

        test("Установка набора пользовательских значений", () => {
            let testItems = [1, "test", 3];
            //с передачей пустого параметра должен установиться null
            testModel.setItems(null);
            expect(testModel["_items"]).toBe(null);

            //c передачей массива любых значений - оно и передаётся
            testModel.setItems(testItems);
            expect(testModel["_items"]).toBe(testItems);
        });

        test("Создание хэндлеров с пользовательскими значениями", () => {
            let prevHandlers = testModel["_handlers"];
            let testHandlers = [{value: 0}, {value: 4}];
            testModel.setItems(null);

            //При передаче значения, приводимого к false или пустого массива, функция не выполняется
            testModel[createHandlersFN](null);
            expect(testModel["_handlers"]).toBe(prevHandlers);

            testModel[createHandlersFN]([]);
            expect(testModel["_handlers"]).toBe(prevHandlers);

            //создание хэндлеров без пользовательского набора значений
            testModel[createHandlersFN](testHandlers);
            expect(testModel["_handlers"][0].handlerIndex).toBe(0);
            expect(testModel["_handlers"][0].itemIndex).toBe(0);
            expect(testModel["_handlers"][0].value).toBe(0);
            expect(testModel["_handlers"][0].position).toBe(0);

            expect(testModel["_handlers"][1].handlerIndex).toBe(1);
            expect(testModel["_handlers"][1].itemIndex).toBe(4);
            expect(testModel["_handlers"][1].value).toBe(4);
            expect(testModel["_handlers"][1].position).toBe(0.4);
            //ситуация, когда не хватает значений на все хэндлеры
            testModel["_min"] = 0;
            testModel["_max"] = 1;
            testModel["_step"] = 1;
            testModel[createHandlersFN]([{value: 0}, {value: 2}, {value: 1}]);
            expect(testModel["_handlers"].length).toBe(2);

            //создание хэндлеров при наличии пользовательского набора значений
            testHandlers = [{value: 1}, {value: 4}];
            testModel.setItems([1, "test", 3]);
            testModel[createHandlersFN](testHandlers);
            expect(testModel["_handlers"][0].handlerIndex).toBe(0);
            expect(testModel["_handlers"][0].itemIndex).toBe(1);
            expect(testModel["_handlers"][0].value).toBe("test");
            expect(testModel["_handlers"][0].position).toBe(0.5);

            expect(testModel["_handlers"][1].handlerIndex).toBe(1);
            expect(testModel["_handlers"][1].itemIndex).toBe(2);
            expect(testModel["_handlers"][1].value).toBe(3);
            expect(testModel["_handlers"][1].position).toBe(1);
        });

        test("Создание стандартных хэндлеров", () => {
            testModel["_min"] = 0;
            testModel["_max"] = 100;
            jest.spyOn(testModel, "range", "get").mockReturnValue(100);
            // @ts-ignore
            const spyCreateHandlers = jest.spyOn(testModel, createHandlersFN).mockImplementationOnce();

            //без пользовательских значений
            testModel[generateDefaultHandlersItemIndexesFN](3);
            expect(spyCreateHandlers).toBeCalledWith([{value: 25}, {value: 50}, {value: 75}]);
            //с пользовательскими значениями
            testModel[generateDefaultHandlersItemIndexesFN](4, [-1, 66, 208, 22]);
            expect(spyCreateHandlers).toBeCalledWith([{value: 0}, {value: 66}, {value: 100}, {value: 22}]);
        });

        describe("Занятие и освобождение значений", () => {
            beforeEach(() => {
                testModel = new Model();
            });

            test("Занятие значения", () => {
                let oldOccupiedItems = testModel["_occupiedItems"];

                testModel.occupyItem(4, 0);
                oldOccupiedItems[4] = 0;
                expect(testModel["_occupiedItems"]).toStrictEqual(oldOccupiedItems);
            });

            test("Освобождение значения", () => {
                let oldOccupiedItems = testModel["_occupiedItems"];

                testModel["_occupiedItems"][4] = 0;
                testModel.releaseItem(4);
                expect(testModel["_occupiedItems"]).toStrictEqual(oldOccupiedItems);
            });

            test("Проверка занятости значения", () => {
                testModel["_occupiedItems"][4] = 0;
                expect(testModel.checkItemOccupancy(4)).toBeTruthy();

                expect(testModel.checkItemOccupancy(2)).toBeFalsy();
            })
        });
    });

    describe("Обмен данными", () => {
        beforeEach(() => {
            testModel = new Model();
        });

        test("Получение данных о хэндлерах", () => {
            //пользовательские хэндлеры
            const testParameters3 = {handlers: [{value: 1}, {value: 3}]};
            testModel = new Model(testParameters3);
            expect(testModel.getHandlersData()).toStrictEqual({
                customHandlers: true, handlersArray: [
                    {index: 0, value: 1, positionPart: 0.1}, {index: 1, value: 3, positionPart: 0.3}
                ]
            });
            //стандартные хэндлеры
            testModel = new Model({isRange: true});
            expect(testModel.getHandlersData()).toStrictEqual({
                customHandlers: false, handlersArray: [
                    {index: 0, value: 3, positionPart: 0.3}, {index: 1, value: 7, positionPart: 0.7}
                ]
            });
        });

        test("Получение данных для слайдера", () => {
            expect(testModel.getSliderData()).toStrictEqual({step: testModel["_step"] / testModel.range});
        });

        test("Обработка изменения позиции хэндлера", () => {
            // @ts-ignore
            const spyGetValueIndexFromPosition = jest.spyOn(testModel, "_getItemIndexFromPosition");
            const testData = {index: 0, position: 0.6};
            const spySetItemIndex = jest.spyOn(testModel["_handlers"][testData.index], "setItemIndex");

            testModel.handleHandlerPositionChanged(testData);
            expect(spyGetValueIndexFromPosition).toBeCalledWith(testData.position);
            expect(spySetItemIndex)
                .toBeCalledWith(spyGetValueIndexFromPosition.mock.results[0].value);
        })
    });
});
