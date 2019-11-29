import "./slider/slider"
import Slider from "./slider/slider";
import Handler from "./slider/__handler/handler";

export default class View {

    private readonly _element: Element;
    private _slider: Slider;

    constructor(element: Element,
                parameters:
                    {
                        isVertical?: boolean,
                        handlers?: {
                            additionalClass?: string,
                            height?: string,
                            width?: string,
                            tooltip?: {
                                additionalClass?: string,
                                position?: string,
                                bodyHTML?: string,
                            },
                        }[],
                    },
    ) {
        this._element = element;
        console.log(parameters.handlers);
        //this._slider = new Slider(parameters);
    }
};
