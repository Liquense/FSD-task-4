import { DEFAULT_SLIDER_PARAMS } from '../../constants';

import SliderModel from '../SliderModel';

import HandlerModel from './HandlerModel';

const testModel = new SliderModel(DEFAULT_SLIDER_PARAMS);
let testHandlerModel: HandlerModel;

beforeEach(() => {
  testHandlerModel = new HandlerModel('testVal', 5, testModel, 0);
});

test('Инициализация', () => {
  const origSetItemIndex = HandlerModel.prototype.setItemIndex;
  HandlerModel.prototype.setItemIndex = jest.fn();

  testHandlerModel = new HandlerModel('testVal', 5, testModel, 0);
  expect(testHandlerModel.getItem()).toBe('testVal');
  expect(testHandlerModel.getItemIndex()).toBe(5);
  expect(testHandlerModel.handlerIndex).toBe(0);
  expect(testHandlerModel.setItemIndex).toBeCalledWith(5);

  HandlerModel.prototype.setItemIndex = origSetItemIndex;
});

test('Установка нового значения', () => {
  const spyCheckItemOccupancy = jest.spyOn(testModel, 'isItemOccupied');
  const spyCalculateValue = jest.spyOn(testModel, 'getItem');
  const spyReleaseItem = jest.spyOn(testModel, 'releaseItem');
  const spyOccupyItem = jest.spyOn(testModel, 'occupyItem');
  const spyHandlerValueChanged = jest.spyOn(testModel, 'handleHandlerValueChanged');

  const newItemIndex = 9; const
    oldItemIndex = testHandlerModel.getItemIndex();
  testHandlerModel.setItemIndex(newItemIndex);
  expect(spyCheckItemOccupancy).toBeCalledWith(newItemIndex);
  expect(testHandlerModel.getItemIndex()).toBe(newItemIndex);
  expect(spyCalculateValue).toBeCalledWith(testHandlerModel.getItemIndex());
  expect(spyReleaseItem).toBeCalledWith(oldItemIndex);
  expect(spyOccupyItem).toBeCalledWith(newItemIndex, testHandlerModel.handlerIndex);
  expect(testHandlerModel.getPosition()).toBe(0.9);
  expect(spyHandlerValueChanged).toBeCalledWith(testHandlerModel);
});
