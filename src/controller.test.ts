import Controller, {SliderView} from "./controller";
import Model from "./model";
import View from "./view";
import {addListenerAfter} from "./common";

jest.mock("./common");
jest.mock("./view");
jest.mock("./model");

let testController: Controller;
const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

let mockAddListenerAfter = addListenerAfter as unknown as jest.Mock;
let mockModel = Model as unknown as jest.Mock;
let mockView = View as unknown as jest.Mock;

const viewsParamName = "_views";
describe("Инициализация контроллера", () => {
    beforeEach(() => {
        mockAddListenerAfter.mockClear();
        mockModel.mockClear();
        mockView.mockClear();
    });

    test("Создание и присваивание экземпляров Model и View", () => {
        testController = new Controller(rootElement);

        expect(testController[viewsParamName][0]).toBe(mockView.mock.instances[0]);
        expect(testController["_model"]).toBe(mockModel.mock.instances[0]);
    });

    test("Назначение слушателей на нужные функции", () => {
        testController = new Controller(rootElement);

        expect(mockAddListenerAfter).toBeCalledWith(
            "handlerValueChanged", testController["_boundPassHandlerValueChange"], testController["_model"]);
        expect(mockAddListenerAfter).toBeCalledWith(
            "handlerPositionChangedCallback", testController["_boundPassHandlerPositionChange"], testController[viewsParamName][0]);
        expect(mockAddListenerAfter).toBeCalledWith(
            "createHandler", testController["_boundViewAddHandler"], testController["_model"]);
    });

    test("Передача данных о слайдере от модели к виду", () => {
        const testData = {test: "data1"};
        // @ts-ignore
        Model.prototype.getSliderData = jest.fn(() => testData);

        testController = new Controller(rootElement);

        expect(testController["_model"].getSliderData).toBeCalled();
        expect(testController[viewsParamName][0].setSliderProps).toBeCalledWith(testData);
    });

    describe("Передача данных о хэндлерах в вид", () => {
        test("Без опциональных параметров", () => {
            testController = new Controller(rootElement);

            expect(testController["_model"].getHandlersData).toBeCalled();
            expect(testController[viewsParamName][0].initHandlers).toBeCalledWith(undefined);
        });

        test("C опциональными параметрами", () => {
            // @ts-ignore
            Model.prototype.getHandlersData = jest.fn(() => {
                return testHandlersData;
            });

            //Без кастомных хэндлеров
            let testParameters = {};
            const testHandlersArray = [
                {index: 0, value: "test1", positionPart: 0.5},
                {index: 1, value: "test2", positionPart: 1}
            ];
            let testHandlersData = {customHandlers: false, handlersArray: testHandlersArray};
            // @ts-ignore
            testController = new Controller(rootElement, testParameters);
            expect(testController["_model"].getHandlersData).toBeCalled();
            expect(testController[viewsParamName][0].initHandlers).toBeCalledWith(testHandlersData);

            //с кастомными хэндлерами
            let testHandlersData2 = [
                {value: 2, withTooltip: true, isEnd: false},
                {value: 3}
            ];

            testParameters = {handlers: testHandlersData2};
            mockView.mockClear();
            mockModel.mockClear();

            testController = new Controller(rootElement, testParameters);
            expect(testController["_model"].getHandlersData).toBeCalled();
            expect(testController[viewsParamName][0].initHandlers).toBeCalledWith({
                customHandlers: false, handlersArray: [
                    {index: 0, value: "test1", positionPart: 0.5, withTooltip: true, isEnd: false},
                    {index: 1, value: "test2", positionPart: 1}
                ]
            });
        });
    });
});

describe("Функции", () => {
    beforeAll(() => {
        testController = new Controller(rootElement);
    });

    describe("Добавление новых видов", () => {
        let testView: SliderView;
        beforeEach(() => {
            testView = new View(null, null);
        });

        test("Один", () => {
            let oldViews = [...testController[viewsParamName]];
            let testView = new View(null, null);
            testController.addView(testView);
            oldViews.push(testView);
            expect(testController[viewsParamName]).toStrictEqual(oldViews);
        });
        test("Несколько", () => {
            let oldViews = [...testController[viewsParamName]];
            let testViews = [new View(null, null), new View(null, null)];
            testController.addViews(testViews);
            oldViews = [...oldViews, ...testViews];
            expect(testController[viewsParamName]).toStrictEqual(oldViews);
        });
    });

    test("Добавление хэндлера в вид", () => {
        mockView.mockClear();
        testController["_addHandlerView"]();

        expect(testController[viewsParamName][0].addHandler).toBeCalled();
    });

    test("Передача позиции хэндлера в модель", () => {
        mockModel.mockClear();

        const testData = {index: 0, position: 0.5};
        testController["_passHandlerPositionChange"](testData);

        expect(testController["_model"].handleHandlerPositionChanged).toBeCalledWith(testData);
    });

    test("Передача изменения значения хэндлера в вид", () => {
        mockView.mockClear();

        const testData = {index: 0, relativeValue: 0.5, item: "test!"};
        testController["_passHandlerValueChange"](testData);

        expect(testController[viewsParamName][0].handlersValuesChangedListener).toBeCalledWith(testData);
    });
});
