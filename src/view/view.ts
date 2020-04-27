import Slider from './slider/slider';
import { Listenable } from '../utils/common';
import { Presentable } from '../utils/types';
import { View } from '../utils/interfaces';

// класс кажется не слишком нужным,
// но в случае, если понадобится какой-то функционал, связанный с другими видами, будет полезен
export default class SliderView implements Listenable, View {
    listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

    private _element: HTMLElement;

    get body(): HTMLElement {
      return this._element;
    }

    private _slider: Slider;

    constructor(element: HTMLElement, parameters?: object) {
      this._element = element;
      this._slider = new Slider(this, parameters);
    }

    /**
     * Вызывается из слайдера, контроллер должен слушать данную функцию
     * и получать результат для передачи в Модель
     * @param handlerIndex
     * @param standardizedPosition
     */
    public handlerPositionChanged(
      handlerIndex: number,
      standardizedPosition: number,
    ): { view: View; index: number; position: number } {
      return { view: this, index: handlerIndex, position: standardizedPosition };
    }

    public handlersValuesChangedListener(
      data: { index: number; relativeValue: number; item: Presentable },
    ): void {
      this._slider.setHandlersData([data]);
    }

    public initHandlers(handlersData: {
        customHandlers: boolean;
        handlersArray: {
            handlerIndex: number;
            positionPart: number;
            item: Presentable;
        }[];
    }): void {
      this._slider.initHandlers(handlersData);
      this._slider.createRanges();
    }

    public passVisualProps(parameters?: {
        isVertical?: boolean; tooltipsVisible?: boolean; withMarkup?: boolean;
    }): void {
      this._slider.update(parameters);
    }

    public passDataProps(sliderData: { min?: number; max?: number; step?: number }): void {
      this._slider.update(sliderData);
    }

    public addHandler(handlerParams: {
        positionPart: number;
        item: Presentable;
        handlerIndex: number;
        itemIndex: number;
        rangePair: number | string;
    }): void {
      this._slider.addHandler(handlerParams);
    }

    public removeHandler(handlerIndex: number): void {
      this._slider.removeHandler(handlerIndex);
    }
}
