import {Listenable} from "../common";
import Controller, {SliderView} from "../controller";

export default class SliderPanel implements Listenable, SliderView {
    listenDictionary: { [key: string]: { func: Function, listeners: Function[] } };

    public boundController: Controller;
    private _isVertical = false;
    private _tooltipsAreVisible = true;
    private _handlers: { index: number, positionPart: number, item: any, itemIndex: number }[] = [];

    static readonly classPrefix = "panel__";

    private readonly _elements: {
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
        this._elements.wrap = parentElement.parentElement;

        this._elements.body = parentElement;
        this._elements.body.classList.add(`${SliderPanel.classPrefix}body`);

        this._createPropertyElements(`Шаг`, `step`);
        this._elements.stepInput.addEventListener("change", this._boundHandleStepInputChange);

        this._createPropertyElements(`Минимум`, `min`);
        this._elements.minInput.addEventListener("change", this._boundHandleMinInputChange);

        this._createPropertyElements(`Максимум`, `max`);
        this._elements.maxInput.addEventListener("change", this._boundHandleMaxInputChange);

        this._createPropertyElements(`Вертикальный?`, `orientation`, true);
        this._elements.orientationInput.addEventListener("change", this._boundHandleOrientationInputChange);

        this._createPropertyElements(`Тултипы видны?`, `tooltipsVisibility`, true);
        this._elements.tooltipsVisibilityInput.addEventListener("change", this._boundHandleTooltipVisibilityInputChange);
    }

    private _boundHandleOrientationInputChange = this._handleOrientationInputChange.bind(this);

    private _handleOrientationInputChange(event: Event) {
        this.setOrientation((event.target as HTMLInputElement).checked);
    }

    private _boundHandleStepInputChange = this._handleStepInputChange.bind(this);

    private _handleStepInputChange(event: Event) {
        const stepInput = (this._elements.stepInput as HTMLInputElement);
        this.boundController.setStep(Number.parseFloat(stepInput.value));
    }

    private _boundHandleMinInputChange = this._handleMinInputChange.bind(this);

    private _handleMinInputChange(event: Event) {
        const minInput = (this._elements.minInput as HTMLInputElement);
        this.boundController.setMin(Number.parseFloat(minInput.value));
    }

    private _boundHandleTooltipVisibilityInputChange = this._handleTooltipVisibilityInputChange.bind(this);

    private _handleTooltipVisibilityInputChange(event: Event) {
        const tooltipVisibilityInput = (this._elements.tooltipsVisibilityInput as HTMLInputElement);
        this._tooltipsAreVisible = tooltipVisibilityInput.checked;
        this.boundController.setTooltipVisibility(tooltipVisibilityInput.checked);
    }

    private _boundHandleMaxInputChange = this._handleMaxInputChange.bind(this);

    private _handleMaxInputChange(event: Event) {
        const maxInput = (this._elements.maxInput as HTMLInputElement);
        this.boundController.setMax(Number.parseFloat(maxInput.value));
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
        SliderPanel._createLabel(`Текущее положение ${handlerIndex + 1} `, `value`, valueWrap);
        const positionInput = SliderPanel._createInput(`value`, valueWrap);

        SliderPanel._createLabel(`Текущее значение ${handlerIndex + 1} `, `item`, valueWrap);
        const itemIndexInput = SliderPanel._createElement(`div`, `item`, valueWrap);


        this._elements.handlerInputs.push({
            index: handlerIndex,
            positionElement: positionInput,
            itemIndexElement: itemIndexInput
        });
        this._elements.handlerInputs[this._elements.handlerInputs.length - 1]
            .positionElement.addEventListener("change", this.handlerPositionChanged);

        this._elements.body.append(valueWrap);
    }

    private _refreshElements() {
        this._refreshOrientation();

        this._handlers.forEach((handler) => {
            this._refreshHandlerPosition(handler.index);
            this._refreshHandlerItem(handler.index);
        })
    };

    private _refreshOrientation() {
        this._elements.wrap.classList.add(this._isVertical ? "vertical" : "horizontal");
        this._elements.wrap.classList.remove(this._isVertical ? "horizontal" : "vertical");

        (this._elements.orientationInput as HTMLInputElement).checked = this._isVertical; //отображение значения вертикальности на чекбоксе
    }

    private _refreshHandlerItem(index: number) {
        let handler = this._elements.handlerInputs.find((input) => {
            return input.index === index;
        });

        handler.itemIndexElement.innerText = this._handlers[index].item;
    }

    private _refreshHandlerPosition(index: number) {
        let handler = this._elements.handlerInputs.find((input) => {
            return input.index === index;
        });

        (handler.positionElement as HTMLInputElement).value = `${this._handlers[index].positionPart.toFixed(2)}`;
    };

    /**
     * Вызов функции контроллера для установки значения ориентации
     * @param isVertical true - вертикально, false - горизонтально
     */
    private setOrientation(isVertical: boolean) {
        this.boundController.setVertical(isVertical);
    }

    public passViewProps(
        parameters?: {
            isVertical?: boolean,
            showTooltips?: boolean,
            isReversed?: boolean,
            withMarkup?: boolean,
        }
    ) {
        if (parameters?.isVertical !== undefined) {
            this._isVertical = parameters.isVertical;
        }

        (this._elements.tooltipsVisibilityInput as HTMLInputElement).checked =
            parameters?.showTooltips === undefined ? this._tooltipsAreVisible : parameters.showTooltips;

        this._refreshElements();
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
        handler.item = data.item;
        this._refreshElements();
    };

    public initHandlers(handlersData: { handlersArray: { index: number, positionPart: number, value: any, valueIndex: number }[] }) {
        this._handlers = [];

        handlersData.handlersArray.forEach(handler => {
            this._handlers.push({
                index: handler.index,
                positionPart: handler.positionPart,
                item: handler.value,
                itemIndex: handler.valueIndex
            });
            this._createHandlerSection(handler.index);
        });

        this._refreshElements();
    };

    public setSliderProps(props: { absoluteStep: number, min: number, max: number }) {
        const maxInput = (this._elements.maxInput as HTMLInputElement);
        if (!maxInput.value) {
            maxInput.value = props.max.toFixed(2);
        }
        const minInput = (this._elements.minInput as HTMLInputElement);
        if (!minInput.value) {
            minInput.value = props.min.toFixed(2);
        }
        const stepInput = (this._elements.stepInput as HTMLInputElement);
        if (!stepInput.value) {
            stepInput.value = props.absoluteStep.toFixed(2);
        }
    };
}
