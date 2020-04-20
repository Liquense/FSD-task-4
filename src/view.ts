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

    /**
     * Вызывается из слайдера, контроллер должен слушать данную функцию и получать результат для передачи в Модель
     * @param handlerIndex
     * @param standardizedPosition
     */
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

    public passVisualProps(parameters?: { isVertical?: boolean, tooltipsVisible?: boolean, withMarkup?: boolean }) {
        this._slider.update(parameters);
    };

    public passDataProps(sliderData: { min?: number, max?: number, step?: number }) {
        this._slider.update(sliderData);
    }

    public addHandler(handlerParams: {
        positionPart: number, value: any, handlerIndex: number, itemIndex: number, rangePair: number | string
    }) {
        this._slider.addHandler(handlerParams);
    }

    public removeHandler(handlerIndex: number) {
        this._slider.removeHandler(handlerIndex);
    }

    public addSliderMousedownListener(listener: Function) {
        this._slider.addOnMouseDownListener(listener);
    }
};
