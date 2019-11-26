import $ from "jquery"
import Controller from "./controller"
import {Handler} from "./slider/__handler/handler";
import {Tooltip} from "./slider/__handler/__tooltip/tooltip";
import {defaultSliderClass} from "./common";

$.fn.liquidSlider = function liquidSlider(
    parameters?: {
        min?: number;
        isVertical?: boolean;
        max?: number;
        handlers?: [Handler];
        sliderClass?: string;
        tooltip?: Tooltip;
        items?: Array<any>;
        isRange?: boolean
    }) {
    let initParameters = {
        sliderClass: defaultSliderClass,
        isVertical: false,
        isRange: false,
        min: 0,
        max: 100,
        step: 5,
        handlers: [new Handler(), new Handler()],
        tooltip: new Tooltip(),
        items: [],
    };

    initParameters = {...initParameters, ...parameters};

    try {
        new Controller($(this).get(), initParameters);
    }
    catch (e) {
        console.log(e.description);
    }

    return this;
};


