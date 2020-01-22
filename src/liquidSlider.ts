import $ from "jquery"
import Controller from "./controller"

/**
 * Расширение JQuery, добавляющее функцию для инициализации слайдера
 * @param parameters
 * @param parameters.additionalClass дополнительный класс
 * @param parameters.items массив элементов, который будет перебираться слайдером
 * (если не указан - будет массив чисел от min до max с шагом step)
 * @param parameters.values текущие значения, если не были переданы свои хэндлеры
 * (если заданы кастомные значения, то текущее значение - номер элемента в массиве)
 * @param parameters.isRange если хэндлеры не заданы вручную - определяет их количество
 * (false - 1, true - 2)
 * @param parameters.isVertical вертикальная ли ориентация
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
 */
$.fn.liquidSlider = function liquidSlider(
    parameters?: {
        additionalClasses?: string,
        items?: Array<any>,
        values?: number[], //если не заданы handlers
        isRange?: boolean, //если не заданы handlers
        isVertical?: boolean,
        isReversed?: boolean,
        min?: number,
        max?: number,
        step?: number,
        handlers?: {
            value: number,
            additionalClasses?: string,
            height?: string,
            width?: string,
            tooltip?: {
                additionalClasses?: string,
                position?: string,
                bodyHTML?: string,
            },
        }[],
    }) {
    let pluginController: Controller;
    try {
        pluginController = new Controller($(this).get()[0], parameters);
    } catch (e) {
        console.log(e);
    }

    return pluginController;
};

