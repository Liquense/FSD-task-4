import {
    addClasses,
    calculateElementCenter,
    defaultSliderClass,
    Listenable,
    parseClassesString
} from "../../common";
import Tooltip from "./__tooltip/tooltip";
import Slider from "../slider";

export default class HandlerView implements Listenable {
    listenDictionary: { function: Function, listeners: Function[] };
    public index: number;

    private _defaultClass = `${defaultSliderClass}__handler`;

    private _additionalClasses: string[];
    set additionalClasses(classesString) {
        this._additionalClasses = parseClassesString(classesString);
    }

    private readonly _tooltip: Tooltip;

    set value(value: any) {
        if (this._tooltip)
            this._tooltip.value = value;
    }

    get positionCoordinate() {
        return calculateElementCenter(this._element.body, this.ownerSlider.isVertical);
    }

    private _positionPart: number;
    get positionPart(): number {
        return this._positionPart;
    }


    private _element: {
        wrap: HTMLElement,
        body: HTMLElement,
    };

    get wrap(): HTMLElement {
        return this._element.wrap;
    };

    get body(): HTMLElement {
        return this._element.body;
    };

    get width(): number {
        return this._element.body.getBoundingClientRect().width;
    }

    get height(): number {
        return this._element.body.getBoundingClientRect().height;
    }


    private _isEnd: boolean = null;
    get isEnd() {
        return this._isEnd === null ? null : this._isEnd;
    };

    get isStart(): boolean {
        return this._isEnd === null ? null : !this._isEnd;
    }

    set isEnd(value: boolean) {
        this._isEnd = value;
    };

    set isStart(value: boolean) {
        this._isEnd = !value;
    }


    public inRange: boolean = false;

    constructor(public ownerSlider: Slider,
                params:
                    {
                        index: number,
                        position: number,
                        value: any,
                        withTooltip?: boolean,
                        isEnd?: boolean,
                        tooltip?: object,
                    }
    ) {
        if (params.isEnd !== undefined)
            this._isEnd = params.isEnd;

        this.createElement(ownerSlider.handlersElement);

        this._tooltip = new Tooltip(this._element.wrap, this, {visibilityState: params?.withTooltip});

        this.index = params.index;
        this._positionPart = params.position;
        this.value = params.value;

        requestAnimationFrame(this.updatePosition.bind(this));
    }

    private createElement(parentElement: HTMLElement): void {
        let wrap = document.createElement("div");
        let body = document.createElement("div");
        const orientationClass = this.ownerSlider.getOrientationClass();

        this._element = {wrap, body};
        this._element.body.setAttribute("tabindex", "-1");

        addClasses(wrap, [`${this._defaultClass}Container`, orientationClass]);
        addClasses(wrap, this._additionalClasses);
        parentElement.appendChild(wrap);

        addClasses(body, [`${this._defaultClass}Body`, orientationClass]);
        wrap.appendChild(body);
    };

    get size(): number {
        return this[this.ownerSlider.expandDimension];
    }

    public calculateOffset(): number {
        return this.ownerSlider.calculateHandlerOffset(this._positionPart);
    }

    //добавляется смещение для правильного отображения хэндлера и тултипа, если тултип больше
    private centerShift(shift): number {
        let handlerSize = this.size;
        let tooltipSize = this._tooltip.getSize();

        const tooltipExcess = Math.max(0, tooltipSize - handlerSize);

        return (shift - 0.5 * tooltipExcess);
    }

    private calculateAccurateOffset(): number {
        let shift = this.calculateOffset();

        return this.centerShift(shift);
    }

    public updatePosition(): void {
        const offset = this.calculateAccurateOffset();

        this._element.wrap.style[this.ownerSlider.offsetDirection] = `${offset}px`;

        this._tooltip?.updatePosition();
    }

    public setPosition(newPositionPart: number) {
        this._positionPart = newPositionPart;
        if (this._element)
            this.updatePosition();
    }

    public setTooltipVisibility(stateToSet: boolean) {
        this._tooltip.setVisibility(stateToSet);
    }
}
