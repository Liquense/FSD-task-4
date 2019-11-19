import {handler} from "./handler"
import {tooltip} from "./tooltip"


class Slider {
    private _class = "liquidSlider";
    private _isVertical = false;
    private _isRange = false;
    private _min = 0;
    private _max = 100;
    private _handlers: [handler];
    private _tooltip: tooltip;
    private _items: Enumerator;

    constructor({
                    vertical,
                    range,
                    step,
                    minimum,
                    maximum,
                    tooltip,
                }) {
    }
}
