import { clamp } from '../../utils/functions';
import { Observable, Observer } from '../../utils/Observer/Observer';
import { SliderModelData } from '../types';

class HandlerModel implements Observable {
  public observers: { [key: string]: Observer } = {};

  private position: number;

  constructor(
    public handlerIndex: number,
    private itemIndex: number,
    sliderData: SliderModelData,
  ) {
    this.setItemIndex(itemIndex, sliderData);
  }

  public getItemIndex(): number {
    return this.itemIndex;
  }

  public getPosition(): number {
    return this.position;
  }

  public setItemIndex(itemIndex: number, sliderData: SliderModelData): void {
    this.itemIndex = itemIndex;
    this.updatePosition(sliderData);
  }

  public updatePosition(sliderData: SliderModelData): void {
    this.position = this.calculatePosition(sliderData);
    if (this.observers.updatePosition) {
      this.observers.updatePosition.callListeners(this);
    }
  }

  private calculatePosition(sliderData: SliderModelData): number {
    const positionPart = ((this.itemIndex - sliderData.min) / sliderData.range);

    return clamp(positionPart, 0, 1);
  }
}

export default HandlerModel;
