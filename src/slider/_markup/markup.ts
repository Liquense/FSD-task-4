import SliderView from "../slider";
import {addClasses, defaultSliderClass} from "../../common";

export default class MarkupView {
    private marks: HTMLElement[] = [];
    private wrap: HTMLElement;
    private orientationClass: string;
    private defaultClass = `${defaultSliderClass}__markup`;

    private getMarkSize() {
        const dimension = this.ownerSlider.expandDimension;
        console.log(this.marks?.[0].getBoundingClientRect());
        return this.marks?.[0].getBoundingClientRect()[dimension];
    }

    constructor(
        public ownerSlider: SliderView,
        private parentElement: HTMLElement
    ) {
        this.orientationClass = this.ownerSlider.getOrientationClass();
        this.createElement();
    }

    private createElement() {
        this.wrap = document.createElement("div");

        addClasses(this.wrap, [`${this.defaultClass}Wrap`, this.orientationClass]);

        this.parentElement.appendChild(this.wrap);
    }

    public clearAllMarks() {

    }

    public addMark(relativePosition: number) {
        let newMark = document.createElement("div");
        addClasses(newMark, [this.defaultClass, this.orientationClass]);
        this.wrap.appendChild(newMark);
        this.marks.push(newMark);

        const handlerOffset = this.ownerSlider.calculateOffset(relativePosition);
        const markOffset = handlerOffset + this.ownerSlider.handlerSize / 2 - this.getMarkSize() / 2;
        newMark.style[this.ownerSlider.offsetDirection] = markOffset;
    }
}
