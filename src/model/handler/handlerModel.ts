import { clamp } from '../../utils/functions';
import { Listenable } from '../../interfaces';
import { Handler, SliderDataContainer, ModelItemManager } from '../interfaces';
import { Presentable } from '../../types';

class HandlerModel implements Listenable, Handler {
  public listenDictionary: {[key: string]: { func: Function; listeners: Function[] }};

  private position: number;

  constructor(
        private item: Presentable,
        public itemIndex: number,
        private readonly parentModel: SliderDataContainer & ModelItemManager,
        public handlerIndex: number,
  ) {
    this.setItemIndex(itemIndex);
  }

  public getItem(): Presentable {
    return this.item;
  }

  public getPosition(): number {
    return this.position;
  }

  public setItemIndex(newItemIndex: number): void {
    const oldItemIndex = this.itemIndex;
    if (this.parentModel.checkItemOccupancy(newItemIndex)) {
      this.updatePosition();
      return;
    }

    this.itemIndex = newItemIndex;
    this.item = this.parentModel.calculateValue(this.itemIndex);
    this.updatePosition();

    this.parentModel.releaseItem(oldItemIndex);
    this.parentModel.occupyItem(newItemIndex, this.handlerIndex);
  }

  private calculatePosition(): number {
    return clamp(
      ((this.itemIndex - this.parentModel.getMin()) / this.parentModel.getRange()),
      0,
      1,
    );
  }

  private updatePosition(): void {
    this.position = this.calculatePosition();
    this.parentModel.handlerValueChanged(this);
  }
}

export default HandlerModel;
export { SliderDataContainer, ModelItemManager };
