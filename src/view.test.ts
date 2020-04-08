import View from "./view";
import Slider from "./slider/slider";

jest.mock("./slider/slider");
const wrapperElement = document.createElement("div");
document.body.appendChild(wrapperElement);

let testView: View;
let mockSlider = (Slider as unknown as jest.Mock);

test("Создание экземпляра класса", () => {
    mockSlider.mockClear();

    let testParameters = {test1: "t1"};
    testView = new View(wrapperElement, testParameters);
    expect(testView.element).toBe(wrapperElement);
    expect(mockSlider).toBeCalledWith(testView, testParameters);
});

describe("Функции", () => {
    let mockSliderInstance;

    function testFunctionCall(sliderFuncName: string, viewFuncName?: string, testData?, addParams?: object) {
        mockSlider.mockClear(); //чтобы не было старых вызовов функций

        if (viewFuncName)
            testView[viewFuncName](testData);

        let passData = testData;
        if (addParams?.["passArray"])
            passData = [testData];

        if (passData || passData === null)
            expect(mockSliderInstance[sliderFuncName]).toBeCalledWith(passData);
        else
            expect(mockSliderInstance[sliderFuncName]).toBeCalled();
    }

    beforeEach(() => {
        mockSlider.mockClear(); //пересоздание экземпляра класса, чтобы быть уверенным, что ...instances[0] - наш слайдер
        testView = new View(wrapperElement, null);
        mockSliderInstance = mockSlider.mock.instances[0];
    });

    test("Вызов инициализации хэндлеров", () => {
        testFunctionCall("initHandlers", "initHandlers", null);
        testFunctionCall("createRanges");

        testFunctionCall("initHandlers", "initHandlers", {});
        testFunctionCall("createRanges");

        testFunctionCall("initHandlers", "initHandlers", {
            customHandlers: false,
            handlersArray: [
                {index: 0, positionPart: 0.6, value: "test1"},
                {index: 1, positionPart: 0.8, value: "test2"}
            ]
        });
        testFunctionCall("createRanges");
    });

    test("Передача данных слушателем изменения значений хэндлеров", () => {
        testFunctionCall("setHandlersData", "handlersValuesChangedListener", [null], {passArray: true});
        testFunctionCall("setHandlersData", "handlersValuesChangedListener", {}, {passArray: true});
        testFunctionCall("setHandlersData", "handlersValuesChangedListener",
            {index: 0, position: 0.1, value: "test1"}, {passArray: true}
        );
    });

    test("Передача данных об изменении позиции хэндлера в виде объекта", () => {
        let result = testView.handlerPositionChanged(0, 0.5);
        expect(result).toStrictEqual({index: 0, position: 0.5});
    });

    test("Установка данных слайдера", () => {
        testFunctionCall("update", "setSliderProps", null);
        testFunctionCall("update", "setSliderProps", {});
        testFunctionCall("update", "setSliderProps", {something: "test"});
    });

    test("Добавление слушателя на нажатие мыши", () => {
        testFunctionCall("addOnMouseDownListener", "addSliderMousedownListener", () => {});
    });
});
