/* eslint-disable @typescript-eslint/ban-ts-ignore */
import * as $ from 'jquery';
import { DEFAULT_SLIDER_PARAMS } from './constants';
import './liquidSlider';

import Controller from './controller/controller';

jest.mock('./controller/controller');

const $testDiv = $(document.body.appendChild(document.createElement('div')));

test('Инициализация слайдера', () => {
  const testParameters = { something: '', anotherArg: 'test1', withMarkup: '' };

  $testDiv.liquidSlider();
  expect(Controller).toBeCalledWith(
    $testDiv.get()[0], { isVertical: false, isTooltipsVisible: true, withMarkup: false },
  );

  $testDiv.liquidSlider(testParameters);
  expect(Controller).toBeCalledWith(
    $testDiv.get()[0], { ...DEFAULT_SLIDER_PARAMS, ...testParameters },
  );
});
