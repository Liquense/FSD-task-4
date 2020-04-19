import {clamp, Listenable} from "./common";
import Model from "./model";

export default class HandlerModel implements Listenable {
    //позиция будет передаваться между моделью и видом в виде доли,
    //потому что это обезличенные данные, которые они могут интерпретировать как им нужно
    private _position: number;

    public listenDictionary: {[key: string] : { func: Function, listeners: Function[] }};

    get value(): any {
        return this._value;
    }

    get position(): number {
        return this._position;
    }

    constructor(
        private _value: any, //непосредственно значение
        public itemIndex: number, //нужно для вычисления положения
        private readonly _parentModel: Model,
        public handlerIndex?: number,
    ) {
        this.setItemIndex(itemIndex);
    }

    private calculatePosition() {
        return clamp(
            ((this.itemIndex - this._parentModel.min) / this._parentModel.range),
            0,
            1
        );
    }

    private updatePosition() {
        this._position = this.calculatePosition();
        this._parentModel.handlerValueChanged(this);
    }

    public setItemIndex(newItemIndex: number,) {
        const oldItemIndex = this.itemIndex;
        if (this._parentModel.checkItemOccupancy(newItemIndex)) {
            this.updatePosition();
            return;
        }

        this.itemIndex = newItemIndex;
        this._value = this._parentModel.calculateValue(this.itemIndex);
        this.updatePosition();

        this._parentModel.releaseItem(oldItemIndex);
        this._parentModel.occupyItem(newItemIndex, this.handlerIndex);
    }
}
