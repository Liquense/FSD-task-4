import "./slider/slider"
import Slider from "./slider/slider";
import {Listenable} from "./common";

export default class View implements Listenable {
    listenDictionary: { function: Function, listeners: Function[] };
    public readonly element: HTMLElement;
    private readonly _slider: Slider;
    private readonly _tooltipPositions =
        {
            left: {x: -1, y: 1},
            up: {x: 1, y: -1},
            right: {x: 1, y: 1},
            down: {x: 1, y: 1}
        };

    constructor(element: HTMLElement, parameters: object) {
        this.element = element;
        this._slider = new Slider(this, parameters);
    }

    public handlerPositionChanged(handlerIndex: number, standardizedPosition: number): { index: number, position: number } {
        return {index: handlerIndex, position: standardizedPosition};
    }

    public handlersValuesChangedListener(data: { index: number, position: number, value: any }): void {
        this._slider.setHandlersData([data]);
    }

    public initHandlers(handlersData: {
                            customHandlers: boolean,
                            handlersArray: { index: number, value: any, position: number }[]
                        }
    ) {
        this._slider.initHandlers(handlersData);
        this._slider.createRanges();
    }

    public setSliderData(sliderData: object) {
        this._slider.update(sliderData);
    }

    public addHandler() {
        this._slider.createRanges();
    }

    public addSliderMousedownListener(listener: Function) {
        this._slider.addOnMouseDownListener(listener);
    }
};
