import $ from "jquery"
import Controller from "./controller"

/**
 * Расширение JQuery, добавляющее функцию для инициализации слайдера
 * @param parameters
 * @param parameters.min минимальное значение слайдера
 * @param parameters.max максимальное значение слайдер
 * @param parameters.step шаг слайдера
 * (при использовании массива не-числовых элементов будет относиться к итератору массива)
 * @param parameters.handlers параметры для массива хэндлеров
 *      @param parameters.handlers.additionalClass дополнительный класс, если он нужен пользователю
 *      @param parameters.handlers.height высота хэндлера (строка в css формате типа "15px" или "10%")
 *      @param parameters.handlers.width ширина хэндлера (строка в css формате типа "15px" или "10%")
 *      @param parameters.handlers.tooltip тултип, принадлежащий хэндлеру
 *          @param parameters.handlers.tooltip.additionalClass дополнительный класс
 *          @param parameters.handlers.tooltip.position позиция относительно хэндлера
 *          @param parameters.handlers.tooltip.bodyHTML HTML-код, если нужно заменить стандартный
 * @param parameters.isVertical вертикальная ли ориентация
 * @param parameters.sliderClass дополнительный класс слайдера
 * @param parameters.items массив элементов, который будет перебираться слайдером
 * (если не указан - будет массив чисел от min до max с шагом step)
 */
$.fn.liquidSlider = function liquidSlider(
    parameters?: {
        additionalClass?: string,
        items?: Array<any>,
        isRange?: boolean,
        isVertical?: boolean,
        min?: number,
        max?: number,
        step?: number,
        handlers?: {
            additionalClass?: string,
            height?: string,
            width?: string,
            tooltip?: {
                additionalClass?: string,
                position?: string,
                bodyHTML?: string,
            },
        }[],
    }) {
    let initParameters = {
        isVertical: false,
        isRange: false,
        min: 0,
        max: 100,
        step: 5,
        items: [],
        handlers: undefined
    };

    initParameters = {...initParameters, ...parameters};

    try {
        new Controller($(this).get()[0], initParameters);
    } catch (e) {
        console.log(e.description);
    }

    return this;
};

