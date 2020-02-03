import SliderView from "../slider";
import {addClasses, defaultSliderClass} from "../../common";

export default class MarkupView {
    private marks: HTMLElement[] = [];
    private wrap: HTMLElement;
    private defaultClass = `${defaultSliderClass}__markup`;

    private getMarkSize() {
        const dimension = this.ownerSlider.expandDimension;
        return this.marks?.[0].getBoundingClientRect()[dimension];
    }

    private getRelativeMarkSize() {
        return this.getMarkSize() / this.ownerSlider.getScaleLength();
    }

    constructor(
        public ownerSlider: SliderView,
    ) {
        this.createWrap();
    }

    private createWrap() {
        this.wrap = document.createElement("div");

        addClasses(this.wrap, [`${this.defaultClass}Wrap`, this.ownerSlider.getOrientationClass()]);

        this.ownerSlider.bodyElement.insertBefore(this.wrap, this.ownerSlider.handlersElement);
    }

    private createMarkElement(): HTMLElement {
        let newMark = document.createElement("div");
        addClasses(newMark, [this.defaultClass, this.ownerSlider.getOrientationClass()]);
        this.wrap.appendChild(newMark);

        return newMark;
    }

    private calculateMarkOffset(relativePosition: number, relativeHandlerSize: number): Number {
        return 100 * (relativePosition + relativeHandlerSize / 2 - this.getRelativeMarkSize() / 2);
    }

    public clearAllMarks() {
    }

    public addMark(relativePosition: number, relativeHandlerSize: number) {
        let newMark = this.createMarkElement();
        this.marks.push(newMark);

        newMark.style[this.ownerSlider.offsetDirection] =
            this.calculateMarkOffset(relativePosition, relativeHandlerSize) + "%";
    }
}
