import {Handler} from "./__handler/handler";
import {Tooltip} from "./__handler/__tooltip/tooltip";

export class Slider {
    private _class = "liquidSlider";
    private _isVertical = false;
    private _isRange = false;
    private _min = 0;
    private _max = 100;
    private _handlers: [Handler];
    private _tooltip: Tooltip;
    private _items: Enumerator;

    constructor({
                    // vertical,
                    // range,
                    // step,
                    // minimum,
                    // maximum,
                    // tooltip,
                }) {
    }

    testEvent() {
        return new Promise((resolve, reject) => {
            resolve(`${this} ${this._class}`);
        });
    }

    changeClass(newClass: string) {
        this._class = newClass;
    }
}
