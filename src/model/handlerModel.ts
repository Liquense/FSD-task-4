import { clamp } from '../utils/common';
import { Presentable } from '../utils/types';
import { Listenable } from '../utils/interfaces';

export default class HandlerModel implements Listenable {
  public listenDictionary: {[key: string]: { func: Function; listeners: Function[] }};

  get item(): Presentable {
    return this._item;
  }

  get position(): number {
    return this._position;
  }

  // позиция будет передаваться между моделью и видом в виде доли,
  // потому что это обезличенные данные, которые они могут интерпретировать как им нужно
  private _position: number;

  /**
   * @param _item непосредственно данные
   * @param itemIndex значение-индекс, нужно для вычисления положения
   * @param _parentModel
   * @param handlerIndex
   */
  constructor(
        private _item: Presentable,
        public itemIndex: number,
        private readonly _parentModel: SliderDataContainer & ModelItemManager,
        public handlerIndex: number,
  ) {
    this.setItemIndex(itemIndex);
  }

  public setItemIndex(newItemIndex: number): void {
    const oldItemIndex = this.itemIndex;
    if (this._parentModel.checkItemOccupancy(newItemIndex)) {
      this.updatePosition();
      return;
    }

    this.itemIndex = newItemIndex;
    this._item = this._parentModel.calculateValue(this.itemIndex);
    this.updatePosition();

    this._parentModel.releaseItem(oldItemIndex);
    this._parentModel.occupyItem(newItemIndex, this.handlerIndex);
  }

  private calculatePosition(): number {
    return clamp(
      ((this.itemIndex - this._parentModel.min) / this._parentModel.range),
      0,
      1,
    );
  }

  private updatePosition(): void {
    this._position = this.calculatePosition();
    this._parentModel.handlerValueChanged(this);
  }
}

export interface SliderDataContainer {
 min: number;
 max: number;
 range: number;
}

export interface ModelItemManager {
  releaseItem(itemIndex: number): void;
  occupyItem(itemIndex: number, handlerIndex: number): void;
  checkItemOccupancy(itemIndex: number): boolean;
  calculateValue(itemIndex: number): Presentable;
  handlerValueChanged(handler: HandlerModel): void;
}
