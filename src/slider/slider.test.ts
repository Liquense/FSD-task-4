import Slider from "./slider";
import View from "../view";
import Mock = jest.Mock;
import Tooltip from "./__handler/__tooltip/tooltip";
import MarkupView from "./_markup/markup";

jest.mock("../view");

const testView = new View(null, null);
//@ts-ignore
testView["element"] = document.body.appendChild(document.createElement("div"));
testView.handlerPositionChanged = jest.fn(() => undefined);
let testSlider: Slider;

function resetHTML() {
    document.body.innerHTML = "";
    //@ts-ignore
    testView["element"] = document.body.appendChild(
        document.createElement("div")
    );
}

describe("Инициализация", () => {
    describe("Установка значений полей", () => {
        test("Без передачи необязательных параметров", () => {
            testSlider = new Slider(testView);

            expect(testSlider.isVertical).toBe(false);
            expect(testSlider.isReversed).toBe(true);
            expect(testSlider["_tooltipsAreVisible"]).toBe(true);
            expect(testSlider["_withMarkup"]).toBe(false);
        });
        test("С передачей необязательных параметров", () => {
            testSlider = new Slider(
                testView, {isVertical: true, isReversed: false, showTooltips: false, withMarkup: true}
            );

            expect(testSlider.isVertical).toBe(true);
            expect(testSlider.isReversed).toBe(false);
            expect(testSlider["_tooltipsAreVisible"]).toBe(false);
            expect(testSlider["_withMarkup"]).toBe(true);
        });
    });

    test("Создание HTML-элементов", () => {
        resetHTML();
        testSlider = new Slider(testView);

        const wrap = document.body.querySelector(".liquidSlider");
        const body = document.body.querySelector(".liquidSlider__body");
        const scale = document.body.querySelector(".liquidSlider__scale");
        const handlers = document.body.querySelector(".liquidSlider__handlers");

        expect(testSlider.bodyElement === testSlider["_element"].body && testSlider["_element"].body === body).toBeTruthy();
        expect(testSlider.handlersElement === testSlider["_element"].handlers && testSlider["_element"].handlers === handlers).toBeTruthy();
        expect(testSlider["_element"].wrap).toBe(wrap);
        expect(testSlider["_element"].scale).toBe(scale);
    });

    describe("Проверка слушателей событий", () => {
        beforeEach(() => {
            resetHTML();
            testSlider = new Slider(testView);

            testSlider.bodyElement.style.width = "100px";
            testSlider.getScaleLength = () => 100;
            Object.defineProperty(testSlider, "scaleStart", {
                get: jest.fn(() => 0)
            });

            testSlider.initHandlers(
                {
                    customHandlers: false,
                    handlersArray: [{index: 0, value: "test", positionPart: 0.4}, {
                        index: 1,
                        value: "test2",
                        positionPart: 0.9
                    }]
                }
            );
            Object.defineProperty(testSlider["_handlers"][0], "positionCoordinate", {
                get: jest.fn(() => 40)
            });
            Object.defineProperty(testSlider["_handlers"][1], "positionCoordinate", {
                get: jest.fn(() => 90)
            });
        });

        describe("Нажатие на кнопку мыши", () => {
            let testClicks: Function,
                simulateMouseDown: Function,
                spyOnPreventDefault,
                testMouseDownEvent: Event;

            beforeAll(() => {
                testMouseDownEvent = new Event("mousedown");
                spyOnPreventDefault = jest.spyOn(testMouseDownEvent, "preventDefault");

                simulateMouseDown = function (coordinate: number) {
                    if (testSlider.isVertical)
                        //@ts-ignore
                        testMouseDownEvent.pageY = coordinate;
                    else
                        //@ts-ignore
                        testMouseDownEvent.pageX = coordinate;

                    testSlider.bodyElement.dispatchEvent(testMouseDownEvent);
                };

                testClicks = function () {
                    for (let i = 0; i <= 100; i++) {
                        (testView.handlerPositionChanged as Mock).mockClear();
                        simulateMouseDown(i); //несмотря на клик, позиции хэндлеров остаются неизменными, потому что вью мокнут и нет обмена данными с моделью

                        if (i <= 65)
                            expect(testSlider["_activeHandler"]).toBe(testSlider["_handlers"][0]);
                        else
                            expect(testSlider["_activeHandler"]).toBe(testSlider["_handlers"][1]);

                        expect(testSlider["_activeHandler"].body).toBe(document.activeElement);

                        if (
                            testSlider.calculateMouseRelativePosition(testMouseDownEvent as MouseEvent) !== 0.4
                            && testSlider.calculateMouseRelativePosition(testMouseDownEvent as MouseEvent) !== 0.9
                        ) {
                            expect(testView.handlerPositionChanged).toBeCalledWith(testSlider["_activeHandler"].index, i / 100);
                        }

                        //видимость тултипов
                        if (testSlider["_tooltipsAreVisible"]) {
                            expect(testSlider["_activeHandler"]["_tooltip"]["_element"].classList)
                                .toContain(Tooltip.defaultClass + "_visible");
                        } else {
                            expect(testSlider["_activeHandler"]["_tooltip"]["_element"].classList)
                                .toContain(Tooltip.defaultClass + "_hidden");
                        }
                    }
                }
            });

            beforeEach(() => {
                (spyOnPreventDefault as Mock).mockClear();
            });

            test("По слайдеру", () => {
                testSlider.isVertical = false;
                testClicks();

                testSlider.isVertical = true;
                testClicks();

                expect(spyOnPreventDefault).toBeCalled();
                expect(testSlider["_activeHandler"].body).toBe(document.activeElement); //проверка фокуса на активном хэндлере
            });

            test("Вне слайдера", () => {
                testSlider["_tooltipsAreVisible"] = false;

                document.body.dispatchEvent(testMouseDownEvent);
                expect(testSlider["_activeHandler"]).toBe(null); //если изначально активного хэндлера нет

                simulateMouseDown(0);

                document.body.dispatchEvent(testMouseDownEvent);
                expect(testSlider["_activeHandler"]).toBe(null); //если был активный хэндлер
            });
        });

        describe("Движение мыши", () => {
            test("Проверка срабатывания только при зажатии кнопки мыши", () => {
                const testMouseMoveEvent = new Event("mousemove");
                const testMouseDownEvent = new Event("mousedown");
                //@ts-ignore
                testMouseDownEvent.pageX = 40;
                //@ts-ignore
                testMouseDownEvent.pageY = 40;

                const testMouseUpEvent = new Event("mouseup");
                // @ts-ignore
                const spyMouseMoveHandler = jest.spyOn(testSlider, "_handleMouseMoveBound");

                document.body.dispatchEvent(testMouseMoveEvent);
                expect(spyMouseMoveHandler).not.toBeCalled(); //до нажатия не вызывается обработчик события движения

                testSlider.bodyElement.dispatchEvent(testMouseDownEvent);
                spyMouseMoveHandler.mockClear();
                document.body.dispatchEvent(testMouseMoveEvent);
                expect(spyMouseMoveHandler).toBeCalled(); //после нажатия, но до отпускания - вызывается

                document.body.dispatchEvent(testMouseUpEvent);
                spyMouseMoveHandler.mockClear();
                document.body.dispatchEvent(testMouseMoveEvent);
                expect(spyMouseMoveHandler).not.toBeCalled(); //после отпускания мыши - снова не вызывается
            });
        });
    });
});

describe("Функции", () => {
    beforeAll(() => {
        resetHTML();
        testSlider = new Slider(testView);

        testSlider.initHandlers(
            {
                customHandlers: false,
                handlersArray: [
                    {index: 0, value: "test", positionPart: 0.4},
                    {index: 1, value: "test2", positionPart: 0.9}
                ]
            }
        );
    });

    test("Установка видимости тултипов", () => {
        const spyHandlersSetVisibility = testSlider.handlers.map(handler => {
            return jest.spyOn(handler, "setTooltipVisibility");
        });

        function testTooltipsVisibilityVarSetting(stateToSet: boolean) {
            testSlider.setTooltipsVisibility(stateToSet);
            const stateToCheck = (stateToSet === undefined) || (stateToSet === null) ?
                testSlider["_tooltipsAreVisible"] : stateToSet;
            expect(testSlider["_tooltipsAreVisible"]).toBe(stateToCheck);

            spyHandlersSetVisibility.forEach(spyFunc => {
                expect(spyFunc).toBeCalledWith(stateToCheck); //проверка вызова функции у каждого тултипа с обработанным значением
            });
        }

        testTooltipsVisibilityVarSetting(true);
        testTooltipsVisibilityVarSetting(false);
        testTooltipsVisibilityVarSetting(null);
        testTooltipsVisibilityVarSetting(undefined);
    });

    test("Создание хэндлеров", () => {
        testSlider.isReversed = false;
        testSlider.initHandlers(
            {
                customHandlers: false,
                handlersArray: [
                    {index: 0, value: "test", positionPart: 0.4},
                    {index: 1, value: "test2", positionPart: 0.9}
                ]
            }
        );
        expect(testSlider.handlers[0].isEnd).toBe(testSlider.isReversed);
        expect(testSlider.handlers[1].isEnd).toBe(!testSlider.isReversed);

        testSlider.isReversed = true;
        testSlider.initHandlers(
            {
                customHandlers: false,
                handlersArray: [
                    {index: 0, value: "test", positionPart: 0.4}
                ]
            }
        );
        expect(testSlider.handlers[0].isEnd).toBe(!testSlider.isReversed);

        testSlider.initHandlers(
            {
                customHandlers: true,
                handlersArray: [
                    {index: 0, value: "test", positionPart: 0.4, isEnd: true},
                    {index: 1, value: "test", positionPart: 0.9, isEnd: null},
                    {index: 2, value: "test", positionPart: 0.7, isEnd: false},
                ]
            }
        );
        expect(testSlider.handlers[0].isEnd).toBe(true);
        expect(testSlider.handlers[1].isEnd).toBe(null);
        expect(testSlider.handlers[2].isEnd).toBe(false);
    });

    test("Связывание хэндлеров в диапазоны", () => {
        testSlider.isReversed = false;
        testSlider.initHandlers(
            {
                customHandlers: false,
                handlersArray: [
                    {index: 0, value: "test", positionPart: 0.4},
                    {index: 1, value: "test2", positionPart: 0.9}
                ]
            }
        );
        testSlider.createRanges();
        expect(testSlider["_ranges"][0].startHandler).toBe(testSlider.handlers[0]);
        expect(testSlider["_ranges"][0].endHandler).toBe(testSlider.handlers[1]);

        testSlider.isReversed = true;
        testSlider.initHandlers(
            {
                customHandlers: false,
                handlersArray: [
                    {index: 0, value: "test", positionPart: 0.4},
                    {index: 1, value: "test2", positionPart: 0.9}
                ]
            }
        );
        testSlider.clearRanges();
        testSlider.createRanges();
        expect(testSlider["_ranges"][0].startHandler).toBe(null);
        expect(testSlider["_ranges"][0].endHandler).toBe(testSlider.handlers[0]);
        expect(testSlider["_ranges"][1].startHandler).toBe(testSlider.handlers[1]);
        expect(testSlider["_ranges"][1].endHandler).toBe(null);

        testSlider.initHandlers({
            customHandlers: false,
            handlersArray: [
                {index: 0, value: "test", positionPart: 0.4},
            ]
        });
        testSlider.clearRanges();
        testSlider.createRanges();
        expect(testSlider["_ranges"][0].startHandler).toBe(testSlider.handlers[0]);
        expect(testSlider["_ranges"][0].endHandler).toBe(null);

        //Кастомные
        testSlider.initHandlers(
            {
                customHandlers: true,
                handlersArray: [
                    {index: 0, value: "test", positionPart: 0.4, isEnd: true},
                    {index: 1, value: "test", positionPart: 0.9, isEnd: null},
                    {index: 2, value: "test", positionPart: 0.7, isEnd: false},
                ]
            }
        );
        testSlider.clearRanges();
        testSlider.createRanges();
        expect(testSlider["_ranges"][0].startHandler).toBe(null);
        expect(testSlider["_ranges"][0].endHandler).toBe(testSlider.handlers[0]);
        expect(testSlider["_ranges"][1]).toBe(undefined);
        expect(testSlider["_ranges"][2]).toBe(undefined);
    });

    test("Создание разметки", async () => {
        testSlider.isVertical = false;
        const origGetScaleLength = testSlider.getScaleLength;
        const mockAddMark = jest.fn();
        MarkupView.prototype.addMark = mockAddMark;

        testSlider.clearRanges();
        testSlider["_withMarkup"] = true;
        testSlider.initHandlers({
            customHandlers: false,
            handlersArray: [{index: 0, value: "test", positionPart: 0.5}]
        });
        testSlider.getScaleLength = () => 100;

        expect(testSlider["_markup"]?.ownerSlider).toBe(testSlider);
        await new Promise(resolve => requestAnimationFrame(() => {
            resolve();
        }));

        const marksCount = 1 / testSlider["_step"]; //1 - потому что во View относительные величины от 0 до 1
        expect(mockAddMark.mock.calls.length).toBe(marksCount);
        for (let i = 1; i < marksCount; i++) {
            expect(mockAddMark).toBeCalledWith(Number.parseFloat((testSlider["_step"] * i).toFixed(4)), 0);
        }

        testSlider.getScaleLength = origGetScaleLength;
    });

    test("Установка данных хэндлеров", () => {
        testSlider.initHandlers({
            customHandlers: false,
            handlersArray: [{index: 0, value: "test", positionPart: 0.5}, {index: 2, value: "test2", positionPart: 1}]
        });
        const spySetValue1 = jest.spyOn(testSlider.handlers[0], "setValue"),
            spySetValue2 = jest.spyOn(testSlider.handlers[1], "setValue");
        const spySetPosition1 = jest.spyOn(testSlider.handlers[0], "setPosition"),
            spySetPosition2 = jest.spyOn(testSlider.handlers[1], "setPosition");

        const newValue1 = "new test", newValue2 = "new test2";
        const newPosition1 = 0.1, newPosition2 = 0.8;
        testSlider.setHandlersData([
            {index: 0, item: newValue1, relativeValue: newPosition1},
            {index: 2, item: newValue2, relativeValue: newPosition2}
        ]);
        //
        expect(spySetValue1).toBeCalledWith(newValue1);
        expect(spySetValue2).toBeCalledWith(newValue2);

        expect(spySetPosition1).toBeCalledWith(newPosition1);
        expect(spySetPosition2).toBeCalledWith(newPosition2);
    });

    test("Обновление данных слайдера", () => {
        testSlider.update({step: 1.5});
        expect(testSlider["_step"]).toBe(1.5);

        const previousStep = testSlider["_step"];

        testSlider.update({step: null});
        expect(testSlider["_step"]).toBe(previousStep);
    });

    test("Добавление пользовательского слушателя на стандартный обработчик нажатия кнопки мыши", () => {
        const mockListener = jest.fn(() => {
        });
        const testEvent = new Event("mousedown");

        testSlider.addOnMouseDownListener(mockListener);
        testSlider["_element"].body.dispatchEvent(testEvent);
        expect(mockListener).toBeCalledWith(testEvent);
    });
});
