import $ from "jquery";
import "../liquidSlider"
import "../slider/slider.scss"

let $slider = $(".initSliderHere").liquidSlider({
    min: -50,
    max: 20,
    step: 1
});

let $slider2 = $(".initSliderHere").liquidSlider({
    items: [
        1,
        {
            toString() {
                return "two"
            }
        },
        "<div>three</div>"
    ],
    min: 0,
    max: 22,
    isRange: true
});

let $slider3 = $(".initSliderHere").liquidSlider({
    handlers: [{value: 2}, {value: 6}, {value: 19}],
});
