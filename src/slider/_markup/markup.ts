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

    constructor(
        public ownerSlider: SliderView,
    ) {
        this.createElement();
    }

    private createElement() {
        this.wrap = document.createElement("div");

        addClasses(this.wrap, [`${this.defaultClass}Wrap`, this.ownerSlider.getOrientationClass()]);

        this.ownerSlider.bodyElement.insertBefore(this.wrap, this.ownerSlider.handlersElement);
    }

    public clearAllMarks() {

    }

    public addMark(relativePosition: number) {
        let newMark = document.createElement("div");
        addClasses(newMark, [this.defaultClass, this.ownerSlider.getOrientationClass()]);
        this.wrap.appendChild(newMark);
        this.marks.push(newMark);

        const handlerOffset = this.ownerSlider.calculateOffset(relativePosition);
        const markOffset = handlerOffset + this.ownerSlider.handlerSize / 2 - this.getMarkSize() / 2;
        newMark.style[this.ownerSlider.offsetDirection] = markOffset;
    }
}
