import $ from "jquery";
import "../liquidSlider"
import "../slider/slider.scss"

let $slider = $(".initSliderHere").liquidSlider();
let $slider2 = $(".initSliderHere").liquidSlider({
    isRange: true,
});
