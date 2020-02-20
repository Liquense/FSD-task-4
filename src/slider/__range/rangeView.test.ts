import RangeView from "./rangeView";
import Slider from "../slider";
import HandlerView from "../__handler/handler";

jest.mock("../__handler/handler");
jest.mock("../slider");
let testRange: RangeView;

const testSlider = new Slider(null, {});
// @ts-ignore
testSlider.scaleStart = 0;
// @ts-ignore
testSlider.scaleEnd = 100;
// @ts-ignore
testSlider.scaleBorderWidth = 2;

const horizontalClass = "horizontal", verticalClass = "vertical";
testSlider.getOrientationClass = jest.fn(function () {
    return this.isVertical ? verticalClass : horizontalClass;
});

const firstHandler = new HandlerView(testSlider, null);
const secondHandler = new HandlerView(testSlider, null);

describe("Инициализация", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        testRange = new RangeView(testSlider, document.body, firstHandler, secondHandler);
    });

    test("Установка значений полей", () => {
        expect(testRange.parentElement).toBe(document.body);
        expect(testRange["parentSlider"]).toBe(testSlider);
    });

    describe("Правильное назначение хэндлеров", () => {
        test("Один хэндлер", () => {
            firstHandler.isStart = false;
            testRange = new RangeView(testSlider, document.body, firstHandler);
            expect(testRange.endHandler).toBe(firstHandler);

            firstHandler.isStart = true;
            testRange = new RangeView(testSlider, document.body, firstHandler);
            expect(testRange.startHandler).toBe(firstHandler);
        });
        test("Два хэндлера", () => {
            let testTwoHandlers = function (firstPos, secondPos) {
                //@ts-ignore
                firstHandler.positionPart = firstPos;
                //@ts-ignore
                secondHandler.positionPart = secondPos;
                testRange = new RangeView(testSlider, document.body, firstHandler, secondHandler);
            };

            testTwoHandlers(0, 0);
            expect(testRange.startHandler).toBe(firstHandler);
            expect(testRange.endHandler).toBe(secondHandler);

            testTwoHandlers(0, 1);
            expect(testRange.startHandler).toBe(firstHandler);
            expect(testRange.endHandler).toBe(secondHandler);

            testTwoHandlers(1, 0);
            expect(testRange.startHandler).toBe(secondHandler);
            expect(testRange.endHandler).toBe(firstHandler);
        });
    });

    describe("Создание HTML-тела", () => {
        test("Создание горизонтально", () => {
            const expectedBody = document.body.querySelector(".liquidSlider__range." + horizontalClass);
            expect(testRange["_element"]).toBe(expectedBody);
        });
        test("Создание вертикально", () => {
            document.body.innerHTML = "";
            testSlider.isVertical = true;
            testRange = new RangeView(testSlider, document.body, firstHandler, secondHandler);

            const expectedBody = document.body.querySelector(".liquidSlider__range." + verticalClass);
            expect(testRange["_element"]).toBe(expectedBody);
        });

        describe("Добавление стилей", () => {
            beforeAll(() => {
                //@ts-ignore
                firstHandler.positionCoordinate = 20;
                //@ts-ignore
                secondHandler.positionCoordinate = 80;
            });

            test("Один хэндлер", async () => {
                function initTest(handlerSide, offsetDirection, expandDimension) {
                    return new Promise(resolve => {
                        firstHandler.isStart = handlerSide;
                        //@ts-ignore
                        testSlider.offsetDirection = offsetDirection;
                        //@ts-ignore
                        testSlider.expandDimension = expandDimension;

                        testRange = new RangeView(testSlider, document.body, firstHandler);

                        requestAnimationFrame(() => {
                            resolve();
                        });
                    });
                }

                await initTest(true, "left", "width");
                expect(testRange["_element"].style.left).toBe(`20px`);
                expect(testRange["_element"].style.width).toBe("78px");

                await initTest(true, "top", "height");
                expect(testRange["_element"].style.top).toBe(`20px`);
                expect(testRange["_element"].style.height).toBe("78px");

                await initTest(false, "left", "width");
                expect(testRange["_element"].style.left).toBe(`2px`);
                expect(testRange["_element"].style.width).toBe("18px");

                await initTest(false, "top", "height");
                expect(testRange["_element"].style.top).toBe(`2px`);
                expect(testRange["_element"].style.height).toBe("18px");
            });

            test("Два хэндлера", async () => {
                //@ts-ignore
                firstHandler.positionPart = 0;
                //@ts-ignore
                secondHandler.positionPart = 1;

                function initTest(offsetDirection, expandDimension) {
                    return new Promise(resolve => {
                        //@ts-ignore
                        testSlider.offsetDirection = offsetDirection;
                        //@ts-ignore
                        testSlider.expandDimension = expandDimension;

                        testRange = new RangeView(testSlider, document.body, firstHandler, secondHandler);

                        requestAnimationFrame(() => {
                            resolve();
                        });
                    });
                }

                await initTest("left", "width");
                expect(testRange["_element"].style.left).toBe(`20px`);
                expect(testRange["_element"].style.width).toBe("60px");

                await initTest("top", "height");
                expect(testRange["_element"].style.top).toBe(`20px`);
                expect(testRange["_element"].style.height).toBe("60px");
            });
        });
    });

    test("Подписка на изменения хэндлеров", () => {
        const mockUpdatePosition = jest.fn();
        const origUpdatePosition = RangeView.prototype.updatePosition;

        RangeView.prototype.updatePosition = mockUpdatePosition;
        testRange = new RangeView(testSlider, document.body, firstHandler, secondHandler);
        RangeView.prototype.updatePosition = origUpdatePosition;

        expect(mockUpdatePosition.mock.calls.length).toBe(0);

        firstHandler["updatePosition"]();
        expect(mockUpdatePosition.mock.calls.length).toBe(1);

        secondHandler["updatePosition"]();
        expect(mockUpdatePosition.mock.calls.length).toBe(2);
    });
})
;

test("Функция проверки наличия хэндлера", () => {
    //эти хэндлеры добавлены при создании
    expect(testRange.hasHandler(firstHandler)).toBeTruthy();
    expect(testRange.hasHandler(secondHandler)).toBeTruthy();
    //вообще левый хэндлер
    expect(testRange.hasHandler(new HandlerView(null, null))).toBeFalsy();
});
