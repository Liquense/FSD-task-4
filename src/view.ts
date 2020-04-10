import "./slider/slider"
import Slider from "./slider/slider";
import {Listenable} from "./common";
import {SliderView} from "./controller";

export default class View implements Listenable, SliderView {
    listenDictionary: { [key: string]: { func: Function, listeners: Function[] } };
    public element: HTMLElement;
    private _slider: Slider;

    constructor(element: HTMLElement, parameters?: object) {
        this.element = element;
        this._slider = new Slider(this, parameters);
    }

    public passViewProps(parameters?: { isVertical?: boolean, tooltipsVisible?: boolean  }) {
        this._slider.update(parameters);
    };

    public handlerPositionChanged(
        handlerIndex: number,
        standardizedPosition: number
    ): { index: number, position: number } {
        return {index: handlerIndex, position: standardizedPosition};
    }

    public handlersValuesChangedListener(data: { index: number, relativeValue: number, item: any }): void {
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

    public setSliderProps(sliderData: {min?: number, max?: number, step?: number }) {
        this._slider.update(sliderData);
    }

    public addHandler() {
        //todo: добавление хэндлера
        this._slider.createRanges();
    }

    public addSliderMousedownListener(listener: Function) {
        this._slider.addOnMouseDownListener(listener);
    }
};
