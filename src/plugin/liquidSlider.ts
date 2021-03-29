import * as $ from 'jquery';
import { DEFAULT_SLIDER_PARAMS } from '../shared/constants';

import Controller from '../controller/Controller';
import { HandlersModelData, SliderData } from '../model/types';

import { PluginUpdateParams, SliderPluginParams } from './types';

/**
 * Расширение JQuery, добавляющее функцию для инициализации слайдера
 * @param option
 * @param option.items массив элементов, который будет перебираться слайдером
 * (если не указан - будет массив чисел от min до max с шагом step)
 * @param option.values текущие значения, если не были переданы свои хэндлеры
 * (если заданы кастомные значения, то текущее значение - номер элемента в массиве)
 * @param option.isRange если хэндлеры не заданы вручную - определяет их количество
 * (false - 1, true - 2)
 * @param option.isVertical вертикальная ли ориентация
 * @param option.isTooltipsVisible отображаются ли значения хэндлеров
 * @param option.min минимальное значение слайдера
 * @param option.max максимальное значение слайдер
 * @param option.step шаг слайдера
 *  (при использовании массива пользовательских элементов
 *   будет относиться к индексам элементов массива)
 * @param option.handlers параметры для массива хэндлеров
 *      @param option.handlers.itemIndex значение хэндлера
 *      (индекс значения при пользовательских значениях)
 *      @param option.handlers.rangePair объект, с которым нужно связать хэндлер
 *      ('start' - с началом слайдера,'end' - с концом слайдера, <number> - с другим хэндлером)
 *      @param option.handlers.additionalClasses пользовательские классы
 *      @param option.handlers.tooltip тултип, принадлежащий хэндлеру
 *          @param option.handlers.tooltip.additionalClasses пользовательские классы
 * @param params параметры вызываемой функции (если option - строка)
 */
$.fn.liquidSlider = function liquidSlider(
  option: SliderPluginParams | string = {}, ...params: PluginUpdateParams[]
): JQuery | SliderData | HandlersModelData | void {
  const result = this.get().map((element: HTMLElement) => {
    if (typeof option === 'object') {
      const dataOptions = $(element).data();
      const options = { ...DEFAULT_SLIDER_PARAMS, ...dataOptions, ...option };
      const controller = new Controller(element, options);
      this.data('controller', controller);

      return this;
    }

    const controller = this.data('controller');
    if (!controller) {
      throw new Error('Need to init slider before call functions.');
    }
    switch (option) {
      case 'remove':
        this.liquidSlider = liquidSlider;
        this.html(controller.originalHTML);
        this.data('controller', null);
        break;
      default:
        if (!controller[option]) {
          throw new Error(`${option} not found in slider`);
        }
        if (typeof controller[option] !== 'function') {
          throw new Error(`${option} is not a function of slider`);
        }
        return controller[option](...params);
    }
    return null;
  });

  return result.length === 1 ? result[0] : result;
};
