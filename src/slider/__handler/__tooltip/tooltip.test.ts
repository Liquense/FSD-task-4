import HandlerView from "../handler";
import Tooltip from "./tooltip";
import Slider from "../../slider";

jest.mock("../handler");
jest.mock("../../slider");


const defaultOrientationClass = "defaultOrientClass";

let slider = new Slider(null, {});
slider.getOrientationClass = jest.fn(() => {
    return defaultOrientationClass;
});

let handler = new HandlerView(null, {index: 0, position: 0, value: "test"});
handler.ownerSlider = slider;
handler["_element"] = {body: document.body, wrap: null};


beforeEach(() => {
    document.body.innerHTML = "";
});

describe("Создание экземпляра", () => {
    let createElementFunc: Function, setVisibilityFunc: Function, initDefaultParametersFunc: Function;
    let mockCreateElement = jest.fn(), mockSetVisibility = jest.fn(), mockInitDefaultParameters = jest.fn();

    beforeAll(() => {
        createElementFunc = Tooltip.prototype["createElement"];
        Tooltip.prototype["createElement"] =
            mockCreateElement.mockImplementation(function (parentElement) {
                createElementFunc.apply(this, [parentElement]);
            });

        setVisibilityFunc = Tooltip.prototype["setVisibility"];
        Tooltip.prototype["setVisibility"] = mockSetVisibility;

        initDefaultParametersFunc = Tooltip.prototype["initDefaultParameters"];
        Tooltip.prototype["initDefaultParameters"] =
            mockInitDefaultParameters.mockImplementation(function () {
                return initDefaultParametersFunc.apply(this);
            });
    });

    test("Запуск функций для инициализации", () => {
        new Tooltip(handler["_element"].body, handler);

        expect(mockCreateElement).toBeCalled();
        expect(mockSetVisibility).toBeCalled();
        expect(mockInitDefaultParameters).toBeCalled();
    });

    test("Корректное заполнение свойств", () => {
        let tooltip = new Tooltip(handler["_element"].body, handler);
        expect(tooltip["_addClasses"]).toStrictEqual([]);
        expect(tooltip.value).toBe(undefined);

        mockSetVisibility.mock.calls = [];
        tooltip = new Tooltip(handler["_element"].body, handler,
            {
                additionalClasses: ["test0"],
                visibilityState: false,
                value: "testValue",
                bodyHTML: "<div></div>"
            });
        expect(tooltip["_addClasses"]).toStrictEqual(["test0"]);
        expect(mockSetVisibility.mock.calls[0][0]).toBe(false);
    });

    test("Создание элемента", () => {
        let tooltip = new Tooltip(handler["_element"].body, handler);
        expect(handler["_element"].body.innerHTML)
            .toBe('<div class="liquidSlider__handlerTooltip defaultOrientClass">undefined</div>');
    });

    afterAll(() => {
        Tooltip.prototype["createElement"] = function (parentElement) {
            createElementFunc.apply(this, [parentElement])
        };
        Tooltip.prototype["setVisibility"] = function (visibilityState) {
            setVisibilityFunc.apply(this, [visibilityState])
        };
        Tooltip.prototype["initDefaultParameters"] = function () {
            return initDefaultParametersFunc.apply(this)
        };
    })
});
describe("Функционал", () => {
    describe("Установка видимости", () => {
        let tooltip: Tooltip;

        beforeAll(() => {
            tooltip = new Tooltip(handler["_element"].body, handler);
        });

        test("Показать", () => {
            tooltip.setVisibility(true);
            expect(tooltip.element.classList).toContain("liquidSlider__handlerTooltip_visible");
            expect(tooltip.element.classList).not.toContain("liquidSlider__handlerTooltip_hidden");
        });

        test("Скрыть", () => {
            tooltip.setVisibility(false);
            expect(tooltip.element.classList).toContain("liquidSlider__handlerTooltip_hidden");
            expect(tooltip.element.classList).not.toContain("liquidSlider__handlerTooltip_visible");
        });
    });

    test("Получение размера", () => {
        let tooltip = new Tooltip(handler["_element"].body, handler);

        slider.isVertical = false;
        expect(tooltip.getSize()).toBe(tooltip.element.getBoundingClientRect().width);

        slider.isVertical = true;
        expect(tooltip.getSize()).toBe(tooltip.element.getBoundingClientRect().height);
    });

    test("Добавление классов", () => {
        let tooltip = new Tooltip(handler["_element"].body, handler);

        tooltip.addClassesFromString("test1  test2 test3_anotherClass");
        expect(tooltip["_addClasses"]).toStrictEqual(["test1", "test2", "test3_anotherClass"]);
    });

    test("Установка значения", () => {
        let tooltip = new Tooltip(handler["_element"].body, handler);

        function testValueChange(testValue: any) {
            tooltip.value = testValue;
            expect(tooltip["_value"]).toBe(testValue);
            expect(tooltip["_innerHTML"]).toBe(testValue.toString());
            expect(tooltip["_element"].innerHTML).toBe(testValue.toString());
        }

        testValueChange("testValue");
        testValueChange(1);
        testValueChange(true);
        testValueChange("<div>something</div>");
    });
});