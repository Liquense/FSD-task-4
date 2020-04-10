import View from "../../view";
import Slider from "../slider";
import MarkupView from "./markup";

document.body.innerHTML = '<div class="liquidSlider liquidSlider_horizontal"></div>';
const sliderContainer = document.querySelector(".liquidSlider") as HTMLElement;
const view = new View(sliderContainer, {});
let slider = new Slider(view, {withMarkup: true});
let markup: MarkupView;

describe("Инициализация экземпляра разметки", function () {
    test("Конструктор разметки правильно заполняет владельца-слайдера", () => {
        expect(new MarkupView(slider).ownerSlider).toBe(slider);
    });

    test("Вызывается создание элемента", () => {
        const oldFunc = MarkupView.prototype["createWrap"];
        const mockFunc = jest.fn(() => {
        });

        MarkupView.prototype["createWrap"] = mockFunc;

        markup = new MarkupView(slider);

        MarkupView.prototype["createWrap"] = oldFunc;
        expect(mockFunc.mock.calls.length).toBe(1);
    });
});

describe("Функционал разметки", function () {
    beforeAll(() => {
        markup = new MarkupView(slider);
        markup["wrap"].outerHTML = "";
    });

    test("Создание обертки на странице", () => {
        markup["createWrap"]();
        expect(
            slider.bodyElement.innerHTML
                .includes(markup["wrap"].outerHTML)
        ).toBeTruthy();
    });

    test("Получение ширины метки", () => {
        const dimension = slider.expandDimension;
        markup.addMark(null, null);

        expect(markup["getMarkThickness"]()).toBe(markup["_marks"][0].getBoundingClientRect()[dimension]);
    });

    describe("Получение относительной ширины метки", () => {
        beforeAll(() => {
            slider = new Slider(view, {withMarkup: true});

            markup = new MarkupView(slider);
            markup["getMarkThickness"] = jest.fn(() => {
                return 1;
            });
        });

        test("При нулевой или отсутствующей длине шкалы", () => {
            slider.getScaleLength = jest.fn(() => {
                return 0;
            });
            expect(markup["getRelativeMarkThickness"]()).toBe(0);
        });

        test("При правильной длине шкалы", () => {
            slider.getScaleLength = jest.fn(() => {
                return 100;
            });
            expect(markup["getRelativeMarkThickness"]()).toBe(0.01);
        });
    });

    describe("Добавление метки", () => {
        beforeEach(() => {
            slider = new Slider(view, {withMarkup: true});
            markup = new MarkupView(slider);
        });

        test("Добавление в массив меток", () => {
            let arrayLength = markup["_marks"].length;
            markup.addMark(null, null);
            expect(markup["_marks"].length).toBe(arrayLength + 1);
        });

        describe("Создание и размещение", () => {
            beforeEach(() => {
                slider["_element"]["scale"] = document.body;
            });

            test("Правильный расчёт смещения", () => {
                markup.addMark(null, null);
                expect(markup["calculateMarkOffset"](0.5, 0)).toBe(50);
                expect(markup["calculateMarkOffset"](0.5, 0.1)).toBe(55);
                expect(markup["calculateMarkOffset"](0, 0.1)).toBe(5);
            });

            test("Создание элемента с правильным стилем", () => {
                function expectOffsetStyle () {
                    markup.addMark(0.5, 0);
                    expect(markup["wrap"].innerHTML).toBe(
                        `<div class="liquidSlider__markup ${slider.getOrientationClass()}" style="${slider.offsetDirection}: 50%;"></div>`
                    );
                }

                slider.isVertical = false;
                expectOffsetStyle();

                slider.isVertical = true;
                markup["wrap"].innerHTML = "";
                expectOffsetStyle();
            });
        })
    });

    test("Очистка всех меток", () => {
        markup = new MarkupView(slider);
        const marksCount = Math.floor(Math.random() * Math.floor(100));
        for (let i = 0; i < marksCount; i++) {
            markup.addMark(null, null);
        }
        markup.clearAllMarks();

        expect(markup["_marks"].length).toBe(0);
        expect(markup["wrap"].innerHTML).toBe("");
    });
});
