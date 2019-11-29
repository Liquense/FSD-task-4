import {assert, expect} from "chai"
import Controller from "./controller";
import {defaultSliderClass} from "./common";
import Handler from "./slider/__handler/handler";
import Tooltip from "./slider/__handler/__tooltip/tooltip";

let initParameters = {
    sliderClass: defaultSliderClass,
    isVertical: false,
    isRange: false,
    min: 0,
    max: 100,
    step: 5,
    handlers: undefined,
    tooltip: new Tooltip(),
    items: [],
};

describe("Инициализация контроллера", function() {
    it("При передаче не массива", function () {
        expect(() => {new Controller(null, initParameters)}).to.throw(Error, "There is no HTML elements founded");
    });
});
