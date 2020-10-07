import * as $ from 'jquery';
import './liquidSlider';
import Controller from './controller/controller';
import { DEFAULT_SLIDER_PARAMS } from './utils/common';

jest.mock('./controller/controller');

const $testDiv = $(document.body.appendChild(document.createElement('div')));

test('Инициализация слайдера', () => {
  const testParameters = { something: '', anotherArg: 'test1', withMarkup: '' };

  $testDiv.liquidSlider();
  expect(Controller).toBeCalledWith(
    $testDiv.get()[0], { isVertical: false, showTooltips: true, withMarkup: false },
  );

  $testDiv.liquidSlider(testParameters);
  expect(Controller).toBeCalledWith(
    $testDiv.get()[0], { ...DEFAULT_SLIDER_PARAMS, ...testParameters },
  );
});
