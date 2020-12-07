import { DEFAULT_SLIDER_PARAMS } from '../../constants';

import SliderModel from '../SliderModel';

import HandlerModel from './HandlerModel';

jest.mock('../SliderModel');

const testSliderModel = new SliderModel(DEFAULT_SLIDER_PARAMS);
testSliderModel.handleHandlerValueChanged = jest.fn(() => ({
  handlerIndex: 0,
  positionPart: 0,
  item: 'mock',
  itemIndex: 0,
}));
const testSliderModelData = {
  step: 1, max: 10, min: 0, range: 10,
};
let testHandlerModel: HandlerModel;

beforeEach(() => {
  testHandlerModel = new HandlerModel(0, 5, testSliderModelData);
});

test('Инициализация', () => {
  testHandlerModel = new HandlerModel(0, 5, testSliderModelData);
  expect(testHandlerModel.getItemIndex()).toBe(5);
  expect(testHandlerModel.handlerIndex).toBe(0);
  expect(testHandlerModel.getPosition()).toBe(0.5);
});

test('Установка нового значения', () => {
  const newItemIndex = 9;
  testHandlerModel.addUpdatePositionListener(testSliderModel.handleHandlerValueChanged);

  testHandlerModel.setItemIndex(newItemIndex, testSliderModelData);
  expect(testHandlerModel.getItemIndex()).toBe(newItemIndex);
  expect(testHandlerModel.getPosition()).toBe(0.9);
  expect(testSliderModel.handleHandlerValueChanged).toBeCalledWith(testHandlerModel);
});
