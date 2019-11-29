import {defaultSliderClass} from "../../common";
import Tooltip from "./__tooltip/tooltip";
import tooltip from "./__tooltip/tooltip";

export default class Handler {
    private _defaultClass = `${defaultSliderClass}__handler `;
    public additionalClass: string;
    private _size = "10px";
    private _tooltip: Tooltip;

    private _value: string;
    set value(value: string) {
        this._value = value;
    }

    get value() {
        return this._value;
    }

    //private _class: string; - надо бы интерфейс сделать или микс

    /**
     * Является ли хэндлер началом или концом интервала
     * (используется, если нет привязки к другому хэндлеру: будет интервал от крайних значений слайдера)
     */
    private _isEnd: boolean;
    get isEnd() {
        return this._isEnd;
    };

    get isStart() {
        return !this._isEnd;
    }

    set isEnd(value) {
        this._isEnd = value;
    };

    set isStart(value: boolean) {
        this._isEnd = !value;
    }

    /**
     * связанный хэндлер
     * (между двумя связанными хэндлерами образуются интервалы)
     */
    private _pairedHandler?: Handler;

    /**
     * Связывает хэндлеры в отношения Начало-Конец
     * @param pairHandler хэндлер, с которым связываем
     */
    BindWithHandler(pairHandler: Handler) {
        this._pairedHandler = pairHandler;
        pairHandler._pairedHandler = this;
    };

    /**
     * Отображается ли тултип у хэндлеров
     */
    private _withTooltip: boolean;

    showTooltip() {
        this._withTooltip = true;
    }

    hideTooltip() {
        this._withTooltip = false;
    }

    public handlerBodyHTML: "<div class=\"liquidSlider__handlerBody\"></div>\n";

    /**
     * HTML-код хэндлера
     */
    get bodyHTML() {
        return `<div class=liquidSlider__handlerContainer>${this._tooltip.bodyHTML}${this.handlerBodyHTML}</div>`;
    };

    constructor(value: string, withTooltip = true, isEnd = true,) {
        this._withTooltip = withTooltip;
        this._isEnd = isEnd;
    }
}
