import { clamp } from '../../utils/functions';
import { Handler, SliderDataContainer, ModelItemManager } from '../interfaces';
import { Presentable } from '../../utils/types';

class HandlerModel implements Handler {
  private position: number;

  constructor(
    private item: Presentable,
    private itemIndex: number,
    private readonly parentModel: SliderDataContainer & ModelItemManager,
    public handlerIndex: number,
  ) {
    this.setItemIndex(itemIndex);
  }

  public getItem(): Presentable {
    return this.item;
  }

  public getItemIndex(): number {
    return this.itemIndex;
  }

  public getPosition(): number {
    return this.position;
  }

  public setItemIndex(itemIndex: number): void {
    const oldItemIndex = this.itemIndex;
    if (this.parentModel.isItemOccupied(itemIndex)) {
      this.updatePosition();
      return;
    }

    this.itemIndex = itemIndex;
    this.item = this.parentModel.getItem(this.itemIndex);
    this.updatePosition();

    this.parentModel.releaseItem(oldItemIndex);
    this.parentModel.occupyItem(itemIndex, this.handlerIndex);
  }

  private calculatePosition(): number {
    const sliderData = this.parentModel.getSliderData();
    const positionPart = ((this.itemIndex - sliderData.min) / sliderData.range);

    return clamp(positionPart, 0, 1);
  }

  private updatePosition(): void {
    this.position = this.calculatePosition();
    this.parentModel.handleHandlerValueChanged(this);
  }
}

export default HandlerModel;
