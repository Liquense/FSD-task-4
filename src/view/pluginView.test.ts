import { KeyStringObj } from '../types';

import View from './pluginView';

import SliderView from './slider/sliderView';

jest.mock('./slider/sliderView');
const wrapperElement = document.createElement('div');
document.body.appendChild(wrapperElement);

let testView: View & KeyStringObj;
const mockSlider = (SliderView as unknown as jest.Mock);

test('Создание экземпляра класса', () => {
  mockSlider.mockClear();

  const testParameters = { test1: 't1' };
  testView = new View(wrapperElement, testParameters);
  expect(testView.getBody()).toBe(wrapperElement);
  expect(mockSlider).toBeCalledWith(testView, testParameters);
});

describe('Функции', () => {
  let mockSliderInstance: jest.Mock & KeyStringObj;

  function testFunctionCall(
    sliderFuncName: string, viewFuncName?: string, testData?: object, addParams?: KeyStringObj,
  ): void {
    mockSlider.mockClear();

    if (viewFuncName in testView) { testView[viewFuncName](testData); }

    let passData = testData;
    if (addParams?.['passArray']) { passData = [testData]; }

    if (passData || passData === null) {
      expect(mockSliderInstance[sliderFuncName]).toBeCalledWith(passData);
    } else {
      expect(mockSliderInstance[sliderFuncName]).toBeCalled();
    }
  }

  beforeEach(() => {
    mockSlider.mockClear();
    testView = new View(wrapperElement, null);
    mockSliderInstance = mockSlider.mock.instances[0] as jest.Mock;
  });

  test('Вызов инициализации хэндлеров', () => {
    testFunctionCall('initHandlers', 'initHandlers', null);
    testFunctionCall('createRanges', 'initHandlers');

    testFunctionCall('initHandlers', 'initHandlers', {});
    testFunctionCall('createRanges', 'initHandlers');

    testFunctionCall('initHandlers', 'initHandlers', {
      customHandlers: false,
      handlersArray: [
        { index: 0, positionPart: 0.6, value: 'test1' },
        { index: 1, positionPart: 0.8, value: 'test2' },
      ],
    });
    testFunctionCall('createRanges', 'initHandlers');
  });

  test('Передача данных слушателем изменения значений хэндлеров', () => {
    testFunctionCall('setHandlersData', 'handlersValuesChangedListener', [null], { passArray: true });
    testFunctionCall('setHandlersData', 'handlersValuesChangedListener', {}, { passArray: true });
    testFunctionCall('setHandlersData', 'handlersValuesChangedListener',
      { index: 0, position: 0.1, value: 'test1' }, { passArray: true });
  });

  test('Передача данных об изменении позиции хэндлера в виде объекта', () => {
    const result = testView.handleHandlerPositionChanged(0, 0.5);
    expect(result).toStrictEqual({ index: 0, position: 0.5, view: testView });
  });

  test('Обновление данных слайдера', () => {
    testFunctionCall('update', 'passDataProps', null);
    testFunctionCall('update', 'passDataProps', {});
    testFunctionCall('update', 'passDataProps', { something: 'test' });

    testFunctionCall('update', 'passVisualProps', null);
    testFunctionCall('update', 'passVisualProps', {});
    testFunctionCall('update', 'passVisualProps', { something: 'test' });
  });

  test('Добавление хэндлера', () => {
    testFunctionCall('addHandler', 'addHandler');
    testFunctionCall('addHandler', 'addHandler', { test: 'test' });
  });

  test('Удаление хэндлера', () => {
    testFunctionCall('removeHandler', 'removeHandler');
  });
});
