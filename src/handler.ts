import "./common.ts"

export class handler {
    private _class = defaultSliderClass + "__handler ";
    private _value: object;
    private _withTooltip = true;

    showTooltip() {
        this._withTooltip = true;
    }
    hideTooltip() {
        this._withTooltip = false;
    }
}
