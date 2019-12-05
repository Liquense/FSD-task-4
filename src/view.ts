import "./slider/slider"
import Slider from "./slider/slider";

export default class View {
    private readonly _element: Element;
    private readonly _slider: Slider;
    private readonly _tooltipPositions =
        {
            left: {x: -1, y: 1},
            up: {x: 1, y: -1},
            right: {x: 1, y: 1},
            down: {x: 1, y: 1}
        };

    constructor(element: Element, parameters: object) {
        this._element = element;
        this._slider = new Slider(element, parameters);
    }
};
