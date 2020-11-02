import { KeyStringObj } from '../utils/types';

import View from './PluginView';

import SliderView from './slider/SliderView';

jest.mock('./slider/SliderView');
const wrapperElement = document.createElement('div');
document.body.appendChild(wrapperElement);

let testView: View & KeyStringObj;
const mockSlider = (SliderView as jest.Mock);

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
    sliderFuncName: string, viewFuncName?: string, testData?: object, passArray?: boolean,
  ): void {
    mockSlider.mockClear();

    if (viewFuncName in testView) { testView[viewFuncName](testData); }

    let passData;
    if (passArray) { passData = [testData]; }

    if (passData !== undefined) {
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
    testFunctionCall('setHandlersData', 'handlerValueChangedListener', [null], true);
    testFunctionCall('setHandlersData', 'handlerValueChangedListener', {}, true);
    testFunctionCall('setHandlersData', 'handlerValueChangedListener',
      { index: 0, position: 0.1, value: 'test1' }, true);
  });

  test('Передача данных об изменении позиции хэндлера в виде объекта', () => {
    const result = testView.handleHandlerPositionChanged(0, 0.5);
    expect(result).toStrictEqual({ handlerIndex: 0, positionPart: 0.5, view: testView });
  });

  test('Обновление данных слайдера', () => {
    testFunctionCall('update', 'updateData', null);
    testFunctionCall('update', 'updateData', {});
    testFunctionCall('update', 'updateData', { something: 'test' });

    testFunctionCall('update', 'updateVisuals', null);
    testFunctionCall('update', 'updateVisuals', {});
    testFunctionCall('update', 'updateVisuals', { something: 'test' });
  });

  test('Добавление хэндлера', () => {
    testFunctionCall('addHandler', 'addHandler');
    testFunctionCall('addHandler', 'addHandler', { test: 'test' });
  });

  test('Удаление хэндлера', () => {
    testFunctionCall('removeHandler', 'removeHandler');
  });

  test('Получение данных из вью', () => {
    mockSliderInstance.getIsVertical.mockImplementationOnce(() => true);
    mockSliderInstance.getIsTooltipsAlwaysVisible.mockImplementationOnce(() => false);
    mockSliderInstance.getIsInverted.mockImplementationOnce(() => true);
    mockSliderInstance.getWithMarkup.mockImplementationOnce(() => false);

    expect(testView.getViewData()).toStrictEqual({
      isVertical: true,
      isTooltipsVisible: false,
      isInverted: true,
      withMarkup: false,
    });
  });
});
