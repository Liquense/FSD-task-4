/* eslint-disable no-undef */
// eslint-disable-next-line import/no-extraneous-dependencies
import * as $ from 'jquery';

import Controller from './controller/controller';
import { Presentable } from './utils/types';
import { DEFAULT_SLIDER_PARAMS } from './utils/common';

/**
 * Расширение JQuery, добавляющее функцию для инициализации слайдера
 * @param parameters
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
 *  (при использовании массива пользовательских элементов
 *   будет относиться к индексам элементов массива)
 * @param parameters.handlers параметры для массива хэндлеров
 *      @param parameters.handlers.itemIndex значение хэндлера
 *      (индекс значения при пользовательских значениях)
 *      @param parameters.handlers.rangePair объект, с которым нужно связать хэндлер
 *      ('start' - с началом слайдера,'end' - с концом слайдера, <number> - с другим хэндлером)
 *      @param parameters.handlers.additionalClasses пользовательские классы
 *      @param parameters.handlers.tooltip тултип, принадлежащий хэндлеру
 *          @param parameters.handlers.tooltip.additionalClasses пользовательские классы
 */
$.fn.liquidSlider = function liquidSlider(
  parameters?: {
        items?: Presentable[];
        values?: number[]; // если не заданы handlers
        isRange?: boolean; // если не заданы handlers
        isVertical?: boolean;
        isReversed?: boolean;
        min?: number;
        max?: number;
        step?: number;
        showTooltips?: boolean;
        withMarkup?: boolean;
        handlers?: {
            itemIndex: number;
            additionalClasses?: string;
            rangePair?: number | 'start' | 'end';
            tooltip?: {
                additionalClasses?: string;
            };
        }[];
    },
): Controller {
  return new Controller($(this).get()[0], { ...DEFAULT_SLIDER_PARAMS, ...parameters });
};
