import Model from "./model";
import HandlerModel from "./handlerModel";

let testModel = new Model();
let testHandlerModel: HandlerModel;

beforeEach(() => {
    testHandlerModel = new HandlerModel("testVal", 5, testModel, 0);
});

test("Инициализация", () => {
    const origSetItemIndex = HandlerModel.prototype.setItemIndex;
    HandlerModel.prototype.setItemIndex = jest.fn();

    testHandlerModel = new HandlerModel("testVal", 5, testModel, 0);
    expect(testHandlerModel.value).toBe("testVal");
    expect(testHandlerModel.itemIndex).toBe(5);
    expect(testHandlerModel.handlerIndex).toBe(0);
    expect(testHandlerModel["_parentModel"]).toBe(testModel);
    expect(testHandlerModel.setItemIndex).toBeCalledWith(5);

    HandlerModel.prototype.setItemIndex = origSetItemIndex;
});

test("Установка нового значения", () => {
    const spyCheckItemOccupancy = jest.spyOn(testModel, "checkItemOccupancy");
    const spyCalculateValue = jest.spyOn(testModel, "calculateValue");
    const spyReleaseItem = jest.spyOn(testModel, "releaseItem");
    const spyOccupyItem = jest.spyOn(testModel, "occupyItem");
    const spyHandlerValueChanged = jest.spyOn(testModel, "handlerValueChanged");

    const newItemIndex = 9, oldItemIndex = testHandlerModel.itemIndex;
    testHandlerModel.setItemIndex(newItemIndex);
    expect(spyCheckItemOccupancy).toBeCalledWith(newItemIndex);
    expect(testHandlerModel.itemIndex).toBe(newItemIndex);
    expect(spyCalculateValue).toBeCalledWith(testHandlerModel.itemIndex);
    expect(spyReleaseItem).toBeCalledWith(oldItemIndex);
    expect(spyOccupyItem).toBeCalledWith(newItemIndex, testHandlerModel.handlerIndex);
    expect(testHandlerModel["_position"]).toBe(0.9);
    expect(spyHandlerValueChanged).toBeCalledWith(testHandlerModel);
});
