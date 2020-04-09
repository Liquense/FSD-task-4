import {Listenable} from "../common";
import Controller, {SliderView} from "../controller";

export default class SliderPanel implements Listenable, SliderView {
    listenDictionary: { [key: string]: { func: Function, listeners: Function[] } };

    public boundController: Controller;
    private _handlers: { index: number, positionPart: number }[] = [];

    static readonly classPrefix = "panel__";

    private _elements: {
        wrap: HTMLElement, body: HTMLElement,
        handlerInputs: { index: number, positionElement: HTMLElement, itemIndexElement: HTMLElement }[], maxInput: HTMLElement, minInput: HTMLElement,
        stepInput: HTMLElement, orientationInput: HTMLElement, tooltipsVisibilityInput: HTMLElement
    };

    constructor(parentElement: HTMLElement) {
        this._elements = {
            wrap: undefined, body: undefined,
            handlerInputs: [], maxInput: undefined, minInput: undefined,
            stepInput: undefined, orientationInput: undefined, tooltipsVisibilityInput: undefined
        };

        this._elements.wrap = parentElement;
        this._createBody();
        //
        this._createPropertyElements(`Шаг:`, `step`);
        this._createPropertyElements(`Минимум:`, `min`);
        this._createPropertyElements(`Максимум:`, `max`);
        this._createPropertyElements(`Ориентация:`, `orientation`, true);
        this._createPropertyElements(`Отображение тултипов:`, `tooltipsVisibility`, true);
    }

    private _createBody() {
        this._elements.body = document.createElement("div");
        this._elements.body.classList.add(`${SliderPanel.classPrefix}body`);

        this._elements.wrap.append(this._elements.body);
    }

    private static _createElement(elementName: string, classPostfix: string, wrap?: HTMLElement): HTMLElement {
        const propElement = document.createElement(elementName);
        propElement.classList.add(SliderPanel.classPrefix + classPostfix);

        wrap?.append(propElement);

        return propElement;
    }

    private _createWrap(elementClassName: string): HTMLElement {
        return SliderPanel._createElement("div", elementClassName + `Wrap`, this._elements.body);
    }

    private static _createLabel(labelText: string, elementClassName: string, wrap?: HTMLElement): HTMLElement {
        const propLabel = SliderPanel._createElement(`label`, elementClassName + `Label`, wrap);
        propLabel.innerText = labelText;

        return propLabel;
    };

    private static _createInput(elementClassName: string, wrap?: HTMLElement, isCheckbox?: boolean): HTMLElement {
        const propInput = SliderPanel._createElement("input", elementClassName + "Input", wrap);

        if (isCheckbox) propInput.setAttribute("type", "checkbox");

        return propInput;
    };

    /**
     * Создаёт элементы для свойств (обёртка, лейбл и инпут) и вставляет в обёртку панели.
     * @param labelText - текст, который будет записан в лейбле
     * @param elementName - имя элемента для указания класса (step, value и т.д.)
     * @param isCheckbox если true, то инпут будет чекбоксом
     * @private
     */
    private _createPropertyElements(labelText: string, elementName: string, isCheckbox?: boolean) {
        const propWrap = this._createWrap(elementName);

        SliderPanel._createLabel(labelText, elementName, propWrap);

        this._elements[elementName + `Input`] = SliderPanel._createInput(elementName, propWrap, isCheckbox);
    }

    /**
     * Создание инпутов для хэндлеров (проставляются ещё индексы)
     * @param handlerIndex
     * @private
     */
    private _createHandlerSection(handlerIndex: number) {
        const valueWrap = this._createWrap("value");
        SliderPanel._createLabel(`Текущее положение ${handlerIndex + 1}: `, `value`, valueWrap);
        const positionInput = SliderPanel._createInput(`value`, valueWrap);

        SliderPanel._createLabel(`Текущее значение ${handlerIndex + 1}: `, `value`, valueWrap);
        const itemIndexInput = SliderPanel._createElement(`div`, `item`, valueWrap);


        this._elements.handlerInputs.push({index: handlerIndex, positionElement: positionInput, itemIndexElement: itemIndexInput});
        this._elements.handlerInputs[this._elements.handlerInputs.length - 1]
            .positionElement.addEventListener("change", this.handlerPositionChanged);

        this._elements.body.append(valueWrap);
    }


    private updateState() {
        this._handlers.forEach((handler) => {
            this.setHandlerValue(handler.index);
        })
    };

    private setHandlerValue(index: number) {
        let handler = this._elements.handlerInputs.find((input) => {
            return input.index === index;
        });

        (handler.positionElement as HTMLInputElement).value = `${this._handlers[index].positionPart.toFixed(2)}`;
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
        const inputIndex = this._elements.handlerInputs.find((input) => {
            if (input.positionElement === valueInput)
                return true;
        }).index;

        return {index: inputIndex, position: Number.parseFloat(valueInput.value)};
    };

    public handlersValuesChangedListener(data: { index: number, relativeValue: number, item: any }) {
        let handler = this._handlers.find((handler) => {
            return handler.index === data.index;
        });

        handler.positionPart = data.relativeValue;
        this.updateState();
    };

    public initHandlers(handlersData: { handlersArray: { index: number, positionPart: number }[] }) {
        this._handlers = [];

        handlersData.handlersArray.forEach(handler => {
            this._handlers.push({
                index: handler.index,
                positionPart: handler.positionPart
            });
            this._createHandlerSection(handler.index);
        });

        this.updateState();
    };

    public setSliderProps() {
    };
}
