import { SliderPluginParams } from '../../plugin/types';

class Slider {
  public static readonly DEFAULT_CLASS = 'slider';

  private bodyElement: HTMLElement;

  private $slider: JQuery;

  constructor(element: HTMLElement, sliderParams?: SliderPluginParams) {
    this.initElements(element);
    this.initSlider(sliderParams);
  }

  public callPluginFunction(name: string, ...params: any[]): any {
    return this.$slider.liquidSlider(name, ...params);
  }

  private initElements(element: HTMLElement): void {
    this.bodyElement = element;
  }

  private initSlider(params?: SliderPluginParams): void {
    this.$slider = $(this.bodyElement).liquidSlider(params);
  }
}

export default Slider;
