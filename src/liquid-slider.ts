import * as $ from 'jquery';

import { DEFAULT_SLIDER_PARAMS } from './constants';

import Controller from './controller/controller';
import { SliderPluginParams } from './utils/interfaces-types';

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
  parameters?: SliderPluginParams,
): Controller {
  return new Controller($(this).get()[0], { ...DEFAULT_SLIDER_PARAMS, ...parameters });
};