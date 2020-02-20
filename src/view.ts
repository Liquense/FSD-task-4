import "./slider/slider"
import Slider from "./slider/slider";
import {Listenable} from "./common";

export default class View implements Listenable {
    listenDictionary: { function: Function, listeners: Function[] };
    public readonly element: HTMLElement;
    private readonly _slider: Slider;

    constructor(element: HTMLElement, parameters: object) {
        this.element = element;
        this._slider = new Slider(this, parameters);
    }

    public handlerPositionChanged(
        handlerIndex: number,
        standardizedPosition: number
    ): { index: number, position: number } {
        return {index: handlerIndex, position: standardizedPosition};
    }

    public handlersValuesChangedListener(data: { index: number, position: number, value: any }): void {
        this._slider.setHandlersData([data]);
    }

    public initHandlers(handlersData: {
                            customHandlers: boolean,
                            handlersArray: {
                                index: number,
                                positionPart: number,
                                value: any,
                            }[]
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
