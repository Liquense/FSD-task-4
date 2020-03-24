import {defaultSliderClass, parseClassesString} from "../../../common";
import HandlerView from "../handler";

export default class Tooltip {

    private _value: any;
    set value(value) {
        this._value = value;
        this.innerHTML = value;
    }
    get value() {
        return this._value;
    }

    private _innerHTML: string = "";
    set innerHTML(value) {
        this._innerHTML = `${value}`;
        this.updateHTML();
    }

    private _element: HTMLElement;
    get element(): HTMLElement {
        return this._element;
    }

    public static readonly defaultClass = defaultSliderClass + "__handlerTooltip";

    private _addClasses: string[] = [];
    public addClassesFromString(classesString: string) {
        this._addClasses = parseClassesString(classesString);
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
                    additionalClasses?: string[],
                    bodyHTML?: string,
                    value?: any,
                    visibilityState?: boolean,
                }
    ) {
        let defaultParameters = this.initDefaultParameters();
        let parameters = {...defaultParameters, ...params};

        this._addClasses = parameters.additionalClasses;
        this.createElement(parentElement);
        this.value = parameters.value;
        this.setVisibility(parameters.visibilityState !== undefined ? parameters.visibilityState : true);
    }

    private initDefaultParameters() {
        return {
            additionalClasses: [],
            bodyHTML: this._innerHTML,
            withTooltip: true,
            isEnd: true,
        };
    }

    public setVisibility(visibilityState: boolean): void {
        visibilityState ? this.show() : this.hide();
    }

    private show(): void {
        this._element.classList.add(`${Tooltip.defaultClass}_visible`);
        this._element.classList.remove(`${Tooltip.defaultClass}_hidden`);
    }

    private hide(): void {
        this._element.classList.add(`${Tooltip.defaultClass}_hidden`);
        this._element.classList.remove(`${Tooltip.defaultClass}_visible`);
    }

    private createElement(parentElement: HTMLElement) {
        const orientationClass = this.parentHandler.ownerSlider.getOrientationClass();

        this._element = document.createElement("div");
        this._element.classList.add(`${Tooltip.defaultClass}`, orientationClass);
        this._element.innerHTML = this._innerHTML;

        parentElement.appendChild(this._element);
    }

    public updateHTML() {
        this._element.innerHTML = this._innerHTML;
    }
}
