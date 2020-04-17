import HandlerView from "./handler";
import Slider from "../slider";
import Tooltip from "./__tooltip/tooltip";
import Mock = jest.Mock;

jest.mock("../slider");
jest.mock("./__tooltip/tooltip");

const verticalClass = "vertical", horizontalClass = "horizontal";
const testSlider = new Slider(null, null);
testSlider.getOrientationClass = jest.fn(function () {
    return this.isVertical ? verticalClass : horizontalClass;
});
testSlider.calculateHandlerOffset = jest.fn((positionPart) => {
    //для простоты длина слайдера будет 100
    return positionPart * 100;
});
let testHandler: HandlerView;
//@ts-ignore
testSlider.handlersElement = document.body;

function createTestHandler(index = 0, positionPart = 0.5, value: any = "test") {
    return new HandlerView(testSlider, {index, positionPart, value});
}

describe("Инициализация", () => {
    test("Установка значений полей", async () => {
        const mockTooltip = (Tooltip as unknown as Mock);
        mockTooltip.mockClear();
        //только с обязательными параметрами
        const index = 0;
        const positionPart = 0.5;
        const value = "test";
        testHandler = createTestHandler(index, positionPart, value);

        expect(testHandler.index).toBe(index);
        expect(testHandler.positionPart).toBe(positionPart);
        expect(testHandler.value).toBe(value);
        expect(testHandler["_isEnd"]).toBe(null);
        expect(mockTooltip).toBeCalledWith(testHandler.wrap, testHandler, {visibilityState: true});
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                expect(testHandler["_tooltip"].updateHTML).toBeCalled();
                resolve();
            });
        });

        //с необязательными параметрами
        mockTooltip.mockClear();
        const withTooltip = false;
        const isEnd = false;
        testHandler = new HandlerView(testSlider, {index, positionPart, value, withTooltip});

        expect(testHandler["_isEnd"]).toBe(isEnd);
        expect(mockTooltip).toBeCalledWith(testHandler.wrap, testHandler, {visibilityState: withTooltip});
    });
});

test("Установка позиции", () => {
    testHandler = createTestHandler();
    testHandler["element"].body.getBoundingClientRect = jest.fn(function () {
        return {
            //поскольку в тестах ничего не рендерится и функция всегда будет возвращать нули, вручную зададим размер элемента (остальное не интересует)
            height: 10,
            width: 10,
            x: 0, y: 0, bottom: 0, left: 0, right: 0, top: 0, toJSON: undefined
        };
    });

    testHandler["_tooltip"].getSize = function () {
        return 10;
    };

    function checkSettingPosition(isVertical, value) {
        //@ts-ignore
        testSlider.expandDimension = isVertical ? "height" : "width";
        //@ts-ignore
        testSlider.offsetDirection = isVertical ? "top" : "left";

        (testHandler["_tooltip"].updateHTML as Mock).mockClear();
        testHandler.setPosition(parseFloat(value));
        expect(testHandler.wrap.style[testSlider.offsetDirection]).toBe(`${parseFloat(value) * 100}px`);
        expect(testHandler["_tooltip"].updateHTML).toBeCalled();
    }

    checkSettingPosition(true, 0.5);
    checkSettingPosition(false, 0.1);

    (testHandler["_tooltip"].updateHTML as Mock).mockClear();
    testHandler["element"] = undefined;
    testHandler.setPosition(0.5);
    expect(testHandler["_tooltip"].updateHTML).not.toBeCalled();
});

test("Получение центра хэндлера", () => {
    testHandler = createTestHandler();
    testHandler["element"].body.getBoundingClientRect = jest.fn(() => {
        return {
            //поскольку в тестах ничего не рендерится и функция всегда будет возвращать нули, вручную зададим размер элемента (остальное не интересует)
            height: 10, width: 10, left: 0, top: 10, //для рассчета центра элемента
            bottom: 0, right: 0, x: 0, y: 0, toJSON: undefined
        };
    });

    testSlider.isVertical = false;
    expect(testHandler.positionCoordinate).toBe(5);

    testSlider.isVertical = true;
    expect(testHandler.positionCoordinate).toBe(15);
});

describe("Вспомогательные функции", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        testHandler = createTestHandler();
    });

    test("Получение HTML-тела", () => {
        const body = document.body.querySelector(".liquidSlider__handlerBody");

        expect(testHandler.body).toBe(body);
    });

    test("Установка парного элемента в диапазоне", () => {

    });

    test("Установка видимости тултипа", () => {
        const mockTooltip = (Tooltip as unknown as Mock);
        mockTooltip.mockClear();

        let testingVisibilityState = true;
        testHandler.setTooltipVisibility(testingVisibilityState);
        expect(testHandler["_tooltip"].setVisibility).toBeCalledWith(testingVisibilityState);

        testingVisibilityState = false;
        testHandler.setTooltipVisibility(testingVisibilityState);
        expect(testHandler["_tooltip"].setVisibility).toBeCalledWith(testingVisibilityState);
    })
});
