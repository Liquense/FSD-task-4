import {defaultSliderClass} from "../../common";

export default class Handler {
    private _defaultClass = `${defaultSliderClass}__handler `;
    private _value: string;
    //private _class: string; - надо бы интерфейс сделать или микс


    private _isEnd: boolean;
    get isEnd() {
        return this._isEnd;
    };

    set isEnd(value) {
        this._isEnd = value;
    };

    set isStart(value: boolean) {
        this._isEnd = value;
    }


    private _pairedHandler?: Handler;

    /**
     * Связывает хэндлеры в отношения Начало-Конец
     * @param pairHandler хэндлер, с которым связываем
     */
    BindWithHandler(pairHandler: Handler) {
        this._pairedHandler = pairHandler;
        pairHandler._pairedHandler = this;
    };


    private _withTooltip: boolean;

    showTooltip() {
        this._withTooltip = true;
    }

    hideTooltip() {
        this._withTooltip = false;
    }


    private _bodyHTML: string;

    constructor(withTooltip: boolean,) {

    }
}
