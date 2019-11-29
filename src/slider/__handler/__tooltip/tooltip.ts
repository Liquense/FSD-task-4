import {defaultSliderClass} from "../../../common";

export default class Tooltip {
    public bodyHTML = "<div class=\"liquidSlider__handlerData\"></div>\n";
    public additionalClass: string;
    private _defaultClass = defaultSliderClass + "__tooltip ";
    private _currentPosition: string;
    private _positions =
        {
            left: {x: -1, y: 1},
            up: {x: 1, y: -1},
            right: {x: 1, y: 1},
            down: {x: 1, y: 1}
        }
}
