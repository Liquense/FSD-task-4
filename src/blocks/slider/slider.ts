import { SliderPluginParams } from '../../plugin/types';

class Slider {
  public static readonly DEFAULT_CLASS = 'slider';

  private body: HTMLElement;

  private slider: JQuery;

  constructor(element: HTMLElement, sliderParams?: SliderPluginParams) {
    this.initElements(element);
    this.initSlider(sliderParams);
  }

  public callPluginFunction(name: string, ...params: any[]): any {
    return this.slider.liquidSlider(name, ...params);
  }

  private initElements(element: HTMLElement): void {
    this.body = element;
  }

  private initSlider(params?: SliderPluginParams): void {
    this.slider = $(this.body).liquidSlider(params);
  }
}

export default Slider;
