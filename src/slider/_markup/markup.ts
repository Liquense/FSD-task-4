import SliderView from "../slider";
import {defaultSliderClass, KeyStringObj} from "../../common";

export default class MarkupView {
    private _marks: HTMLElement[] = [];
    public wrap: HTMLElement = undefined;
    private _defaultClass = `${defaultSliderClass}__markup`;

    private getMarkThickness() {
        const dimension = this.ownerSlider.expandDimension;
        return (<KeyStringObj>this._marks[0].getBoundingClientRect())[dimension];
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
        this.wrap = document.createElement("div");

        this.wrap.classList.add(`${this._defaultClass}Wrap`, this.ownerSlider.getOrientationClass());

        this.ownerSlider.bodyElement.insertBefore(this.wrap, this.ownerSlider.handlersElement);
    }

    private createMarkElement(): HTMLElement {
        let newMark = document.createElement("div");
        newMark.classList.add(this._defaultClass, this.ownerSlider.getOrientationClass());
        this.wrap.appendChild(newMark);

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
        this.wrap.innerHTML = "";
    }

    public addMark(relativePosition: number, relativeHandlerSize: number) {
        let newMark = this.createMarkElement();
        this._marks.push(newMark);

        const markOffset = this.calculateMarkOffset(relativePosition, relativeHandlerSize);
        (<KeyStringObj>newMark.style)[this.ownerSlider.offsetDirection] = markOffset + "%";
    }
}
