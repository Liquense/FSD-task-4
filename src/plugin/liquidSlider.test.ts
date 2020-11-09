import * as $ from 'jquery';
import { DEFAULT_SLIDER_PARAMS } from '../constants';
import './liquidSlider';

import Controller from '../controller/Controller';
import { SliderPluginParams } from './types';

jest.mock('../controller/controller');

const mockController = Controller as jest.Mock;
mockController.prototype.thing = 'test';
const $testDiv = $(document.body.appendChild(document.createElement('div')));

test('Инициализация слайдера', () => {
  const testParameters: SliderPluginParams = {
    isMarkupVisible: false, isRange: true, max: 50, min: -111,
  };

  $testDiv.liquidSlider();
  expect(mockController).toBeCalledWith($testDiv.get()[0], DEFAULT_SLIDER_PARAMS);

  $testDiv.liquidSlider('remove');
  $testDiv.liquidSlider(testParameters);
  expect(mockController).toBeCalledWith(
    $testDiv.get()[0], { controller: null, ...DEFAULT_SLIDER_PARAMS, ...testParameters },
  );
});

describe('Функции плагина', () => {
  test('Удаление слайдера', () => {
    $testDiv.liquidSlider();
    expect($testDiv.data('controller')).not.toBe(null);
    $testDiv.liquidSlider('remove');
    expect($testDiv.data('controller')).toBe(null);
  });

  describe('Вызов функций контролера', () => {
    beforeEach(() => {
      mockController.mockClear();
    });

    test('Передача неправильного параметра', () => {
      $testDiv.liquidSlider();
      expect(() => $testDiv.liquidSlider('test')).toThrow('test not found in slider');
    });

    test('Передача правильного параметра, но не функции', () => {
      $testDiv.liquidSlider();
      expect(() => $testDiv.liquidSlider('thing')).toThrow('thing is not a function of slider');
    });

    test('Передача правильного параметра', () => {
      $testDiv.liquidSlider();
      $testDiv.liquidSlider('removeHandler');
      expect(mockController.mock.instances[0].removeHandler).toBeCalled();
    });
  });
});
