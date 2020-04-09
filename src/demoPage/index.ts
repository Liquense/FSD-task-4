import "../liquidSlider"
import "../slider/slider.scss"
import SliderPanel from "./sliderPanel";

const sliderInitSelector = ".initSliderHere";
const panelSelector = ".panel";
const panels = [];

$(panelSelector).get().forEach(panelWrap => {
    panels.push(new SliderPanel(panelWrap));
});

let slider = $(sliderInitSelector).liquidSlider({
    min: -50,
    max: 20,
    step: 1,
});
slider.addView(panels[0]);
panels[0].controller = slider;

let slider2 = $(sliderInitSelector).liquidSlider({
    items: [
        1,
        {
            toString() {
                return "two"
            }
        },
        "<img src='https://img.icons8.com/cotton/2x/like--v1.png' alt='heart'>",
        "last"
    ],
    min: 0,
    max: 22,
    isRange: true,
    isReversed: false,
    isVertical: true,
});
slider2.addView(panels[1]);
panels[1].controller = slider2;

let slider3 = $(sliderInitSelector).liquidSlider({
    handlers: [
        {isEnd: true},
        {value: 2, isEnd: false},
        {value: 3, isEnd: true},
        {value: 6, isEnd: false}
    ],
    showTooltips: false,
    withMarkup: true
});
slider3.addView(panels[2]);
panels[2].controller = slider3;
