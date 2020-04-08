import {Listenable} from "../common";
import {SliderView} from "../controller";

export default class SliderPanel implements Listenable, SliderView {
    listenDictionary: { [key: string]: { func: Function, listeners: Function[] } };

    private _handlers: { index: number, positionPart: number }[] = [];

    private _elementsClasses = {
        body: "panel__body",
        valueWrap: "panel__valueWrap", valueLabel: "panel__valueLabel", valueInput: "panel__valueInput",

    };
    private _HTMLElements: {
        wrap: HTMLElement, body: HTMLElement,
        valueInputs: { index: number, element: HTMLElement }[], maxInput: HTMLElement, minInput: HTMLElement
    };

    constructor(parentElement: HTMLElement) {
        this._HTMLElements = {
            wrap: undefined, body: undefined,
            valueInputs: [], maxInput: undefined, minInput: undefined
        };

        this._HTMLElements.wrap = parentElement;
        this._createBody();
    }

    private _createBody() {
        this._HTMLElements.body = document.createElement("div");
        this._HTMLElements.body.classList.add(this._elementsClasses.body);

        this._HTMLElements.wrap.append(this._HTMLElements.body);
    }

    private _createValueSection(handlerIndex: number) {
        const valueWrap = document.createElement("div");
        valueWrap.classList.add(this._elementsClasses.valueWrap);

        const valueLabel = document.createElement("label");
        valueLabel.innerText = `Текущее положение ${handlerIndex + 1}: `;
        valueLabel.classList.add(this._elementsClasses.valueLabel);
        valueWrap.appendChild(valueLabel);

        const valueInput = document.createElement("input");
        this._HTMLElements.valueInputs.push({index: handlerIndex, element: valueInput});
        valueInput.classList.add(this._elementsClasses.valueInput);
        valueWrap.append(valueInput);
        this._HTMLElements.valueInputs[this._HTMLElements.valueInputs.length - 1]
            .element.addEventListener("change", this.handlerPositionChanged);

        this._HTMLElements.body.append(valueWrap);
    }


    private updateState() {
        this._handlers.forEach((handler) => {
            this.setHandlerValue(handler.index);
        })
    };

    private setHandlerValue(index: number) {
        let handler = this._HTMLElements.valueInputs.find((input) => {
            return input.index === index;
        });

        (handler.element as HTMLInputElement).value = `${this._handlers[index].positionPart.toFixed(2)}`;
    };

    public setViewProps(
        element: HTMLElement,
        parameters?: {
            isVertical?: boolean,
            showTooltips?: boolean,
            isReversed?: boolean,
            isRange?: boolean,
            withMarkup?: boolean,
        }
    ) {

    };

    public addHandler() {
    };

    public handlerPositionChanged(event: Event): { index: number, position: number } {
        const valueInput = (event.target as HTMLInputElement);
        const inputIndex = this._HTMLElements.valueInputs.find((input) => {
            if (input.element === valueInput)
                return true;
        }).index;

        return {index: inputIndex, position: Number.parseFloat(valueInput.value)};
    };

    public handlersValuesChangedListener(data: { index: number, relativeValue: number, item: any }) {
        let handler = this._handlers.find((handler) => {
            return handler.index === data.index;
        });

        handler.positionPart = data.relativeValue;
        console.log(data);
        this.updateState();
    };

    public initHandlers(handlersData: { handlersArray: { index: number, positionPart: number }[] }) {
        this._handlers = [];

        handlersData.handlersArray.forEach(handler => {
            this._handlers.push({
                index: handler.index,
                positionPart: handler.positionPart
            });
            this._createValueSection(handler.index);
        });

        this.updateState();
    };

    public setSliderProps() {
    };
}
