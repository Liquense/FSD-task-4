import {addClass, addClasses, defaultSliderClass, parseClassesString, removeClass} from "../../../common";
import HandlerView from "../handler";

export default class Tooltip {

    private _value: any;
    set value(value) {
        this._value = value;
        this.innerHTML = value;
    }

    private _innerHTML = `${this._value}`;
    set innerHTML(value) {
        this._innerHTML = `${value}`;
        this.updateHTML();
    }

    private _element: HTMLElement;
    get element(): HTMLElement {
        return this._element;
    }

    private readonly _defaultClass = defaultSliderClass + "__handlerTooltip";
    private _currentPosition: string;

    private _additionalClasses: string[];
    set additionalClasses(classesString: string) {
        this._additionalClasses = parseClassesString(classesString);
    }

    get width(): number {
        return this.element.getBoundingClientRect().width;
    }

    get height(): number {
        return this.element.getBoundingClientRect().height;
    }

    private isSliderVertical(): boolean {
        return this.parentHandler.ownerSlider.isVertical;
    }

    public getSize(): number {
        if (this.isSliderVertical())
            return this.height;
        else
            return this.width;
    }

    constructor(parentElement: HTMLElement,
                public parentHandler: HandlerView,
                params?: {
                    additionalClass?: string,
                    bodyHTML?: string,
                    value?: any,
                    visibilityState?: boolean,
                }
    ) {
        let defaultParameters = this.initDefaultParameters();
        let parameters = {...defaultParameters, ...arguments};

        this.additionalClasses = parameters.additionalClass;
        this._currentPosition = parameters.position;
        this.createElement(parentElement);
        this.value = params?.value;
        this.setVisibility(params.visibilityState);
    }

    private initDefaultParameters() {
        return {
            additionalClass: "",
            bodyHTML: this.innerHTML,
            withTooltip: true,
            isEnd: true,
            position: undefined,
        };
    }

    public setVisibility(visibilityState: boolean): void {
        visibilityState ? this.show() : this.hide();
    }

    private show(): void {
        addClass(this._element, `${this._defaultClass}_visible`);
        removeClass(this._element, `${this._defaultClass}_hidden`);
    }

    private hide(): void {
        addClass(this._element, `${this._defaultClass}_hidden`);
        removeClass(this._element, `${this._defaultClass}_visible`);
    }

    private createElement(parentElement: HTMLElement) {
        const orientationClass = this.parentHandler.ownerSlider.getOrientationClass();

        this._element = document.createElement("div");
        addClasses(this._element, [`${this._defaultClass}`, orientationClass]);
        this._element.innerHTML = this._innerHTML;

        parentElement.appendChild(this._element);
    }

    public updateHTML() {
        this._element.innerHTML = this._innerHTML;
    }

    public updatePosition() {
        this.updateHTML();
    }
}
