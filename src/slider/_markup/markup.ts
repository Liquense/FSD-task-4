import SliderView from "../slider";
import {addClasses, defaultSliderClass} from "../../common";

export default class MarkupView {
    private _marks: HTMLElement[] = [];
    private _wrap: HTMLElement = undefined;
    private _defaultClass = `${defaultSliderClass}__markup`;

    private getMarkThickness() {
        const dimension = this.ownerSlider.expandDimension;
        return this._marks[0].getBoundingClientRect()[dimension];
    }

    private getRelativeMarkThickness(): number {
        return this.ownerSlider.getScaleLength() ?
            this.ownerSlider.shrinkCoeff * (this.getMarkThickness() / this.ownerSlider.getScaleLength()) :
            0;
    }

    constructor(
        public ownerSlider: SliderView,
    ) {
        this.createWrap();
    }

    private createWrap() {
        this._wrap = document.createElement("div");

        addClasses(this._wrap, [`${this._defaultClass}Wrap`, this.ownerSlider.getOrientationClass()]);

        this.ownerSlider.bodyElement.insertBefore(this._wrap, this.ownerSlider.handlersElement);
    }

    private createMarkElement(): HTMLElement {
        let newMark = document.createElement("div");
        addClasses(newMark, [this._defaultClass, this.ownerSlider.getOrientationClass()]);
        this._wrap.appendChild(newMark);

        return newMark;
    }

    private calculateMarkOffset(relativePosition: number, relativeHandlerSize: number): Number {
        return Number(
            (
                100 *
                (
                    relativePosition
                    + (relativeHandlerSize / 2)
                    - this.getRelativeMarkThickness() / 2
                )
            ).toFixed(4));
    }

    public clearAllMarks() {
        this._marks = [];
        this._wrap.innerHTML = "";
    }

    public addMark(relativePosition: number, relativeHandlerSize: number) {
        let newMark = this.createMarkElement();
        this._marks.push(newMark);

        const markOffset = this.calculateMarkOffset(relativePosition, relativeHandlerSize);
        newMark.style[this.ownerSlider.offsetDirection] = markOffset + "%";
    }
}
