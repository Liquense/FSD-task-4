import "../liquidSlider"
import "../slider/slider.scss"

const sliderInitSelector = ".initSliderHere";

let $slider = $(sliderInitSelector).liquidSlider({
    min: -50,
    max: 20,
    step: 1,
});

let $slider2 = $(sliderInitSelector).liquidSlider({
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

let $slider3 = $(sliderInitSelector).liquidSlider({
    handlers: [
        {isEnd: true},
        {value: 2, isEnd: false},
        {value: 3, isEnd: true},
        {value: 6, isEnd: false}
    ],
    showTooltips: false,
    withMarkup: true
});
