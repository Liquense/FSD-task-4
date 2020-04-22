import {Listenable} from "../common";
import Controller, {SliderView} from "../controller";

export default class SliderPanel implements Listenable, SliderView {
    listenDictionary: { [key: string]: { func: Function, listeners: Function[] } };

    public boundController: Controller;
    private _isVertical = false;
    private _tooltipsAreVisible = true;
    private _withMarkup = false;
    private _handlers: { index: number, positionPart: number, item: any, itemIndex: number }[] = [];
    private options = new Map().set(`Никем`, null).set(`Началом`, `start`).set(`Концом`, `end`);

    static readonly classPrefix = "panel__";

    private readonly _elements: {
        wrap: HTMLElement, body: HTMLElement,
        handlerInputs: { wrap: HTMLElement, index: number, positionElement: HTMLInputElement, itemIndexElement: HTMLInputElement }[], maxInput: HTMLInputElement, minInput: HTMLInputElement,
        stepInput: HTMLInputElement, orientationInput: HTMLInputElement, tooltipsVisibilityInput: HTMLInputElement, markupVisibilityInput: HTMLInputElement,
        newHandlerElements: { itemIndexInput: HTMLInputElement, createButton: HTMLButtonElement, handlerPairSelect: HTMLSelectElement }
    };

    constructor(parentElement: HTMLElement) {
        this._elements = {
            wrap: undefined, body: undefined,
            handlerInputs: [], maxInput: undefined, minInput: undefined, stepInput: undefined,
            orientationInput: undefined, tooltipsVisibilityInput: undefined, markupVisibilityInput: undefined,
            newHandlerElements: undefined
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

        this._createPropertyElements(`Разметка видна?`, `markupVisibility`, true);
        this._elements.markupVisibilityInput.addEventListener("change", this._boundMarkupInputChange);

        this._createNewHandlerSection();
    }

    private _boundNewHandlerElementsClick = this._newHandlerElementsClick.bind(this);

    private _newHandlerElementsClick() {
        const itemIndex = Number.parseFloat(this._elements.newHandlerElements.itemIndexInput.value);
        const rangePair = this.options.get(this._elements.newHandlerElements.handlerPairSelect.selectedOptions[0].text);

        this.boundController.addHandler(itemIndex, rangePair);
    };

    private _boundMarkupInputChange = this._handleMarkupInputChange.bind(this);

    private _handleMarkupInputChange(event: Event) {
        this._withMarkup = (event.target as HTMLInputElement).checked;

        this.boundController.setMarkupVisibility(this._withMarkup);
    }

    private _boundHandleOrientationInputChange = this._handleOrientationInputChange.bind(this);

    private _handleOrientationInputChange(event: Event) {
        this.setOrientation((event.target as HTMLInputElement).checked);
    }

    private _boundHandleStepInputChange = this._handleStepInputChange.bind(this);

    private _handleStepInputChange() {
        const stepInput = this._elements.stepInput;
        this.boundController.setStep(Number.parseFloat(stepInput.value));
    }

    private _boundHandleMinInputChange = this._handleMinInputChange.bind(this);

    private _handleMinInputChange() {
        const minInput = this._elements.minInput;
        this.boundController.setMin(Number.parseFloat(minInput.value));
    }

    private _boundHandleTooltipVisibilityInputChange = this._handleTooltipVisibilityInputChange.bind(this);

    private _handleTooltipVisibilityInputChange() {
        const tooltipVisibilityInput = this._elements.tooltipsVisibilityInput;
        this._tooltipsAreVisible = tooltipVisibilityInput.checked;
        this.boundController.setTooltipVisibility(tooltipVisibilityInput.checked);
    }

    private _boundHandleMaxInputChange = this._handleMaxInputChange.bind(this);

    private _handleMaxInputChange() {
        const maxInput = this._elements.maxInput;
        this.boundController.setMax(Number.parseFloat(maxInput.value));
    }

    private _createNewHandlerSection() {
        const baseClass = `newHandler`;

        const newHandlerWrap = this._createWrap("newHandler");

        SliderPanel._createLabel("Значение", baseClass, newHandlerWrap);
        const newHandlerInput = SliderPanel._createInput(baseClass, newHandlerWrap);

        SliderPanel._createLabel("Соединить с...", baseClass, newHandlerWrap);
        const newHandlerPairSelect = document.createElement(`select`);
        newHandlerPairSelect.classList.add(`${SliderPanel.classPrefix}newHandlerPairSelect`);
        newHandlerWrap.append(newHandlerPairSelect);

        const newHandlerButton = document.createElement(`button`);
        newHandlerButton.innerText = `Создать \n новый хэндлер`;
        newHandlerButton.classList.add(`${SliderPanel.classPrefix}newHandlerButton`);
        newHandlerButton.addEventListener("click", this._boundNewHandlerElementsClick);
        newHandlerWrap.append(newHandlerButton);

        this._elements.newHandlerElements = {
            itemIndexInput: newHandlerInput,
            createButton: newHandlerButton,
            handlerPairSelect: newHandlerPairSelect
        };
        this._fillHandlerBindingSelect();
    }

    private _fillHandlerBindingSelect() {
        this.options.forEach((optionValue, optionKey) => {
            this._addHandlerRangePairOption(optionKey, optionValue);
        });
    }

    private _addHandlerRangePairOption(optionKey: number | string, optionValue: number | string) {
        const handlerPairSelect = this._elements.newHandlerElements.handlerPairSelect;

        let textToShow: string;
        if (typeof optionKey === `number`) {
            textToShow = (optionKey + 1).toString()
        } else {
            textToShow = optionKey;
        }

        this.options.set(textToShow, optionValue);

        const optionElement = document.createElement(`option`);
        optionElement.value = optionKey.toString();
        optionElement.innerText = textToShow;

        handlerPairSelect.options.add(optionElement);
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

    private static _createInput(elementClassName: string, wrap?: HTMLElement, isCheckbox?: boolean): HTMLInputElement {
        const propInput = SliderPanel._createElement("input", elementClassName + "Input", wrap);

        if (isCheckbox) propInput.setAttribute("type", "checkbox");

        return (propInput as HTMLInputElement);
    };

    private static _createButton(text: string, elementClassName: string, wrap?: HTMLElement): HTMLButtonElement {
        const newButton = this._createElement(`button`, elementClassName + `button`, wrap) as HTMLButtonElement;
        newButton.innerText = text;

        return newButton;
    }

    /**
     * Создаёт элементы для свойств (обёртка, лейбл и инпут) и вставляет в обёртку панели.
     * Возвращает обёртку, если в неё нужно добавить ещё что-то
     * @param labelText - текст, который будет записан в лейбле
     * @param elementName - имя элемента для указания класса (step, value и т.д.)
     * @param isCheckbox если true, то инпут будет чекбоксом
     * @private
     */
    private _createPropertyElements(labelText: string, elementName: string, isCheckbox?: boolean) {
        const propWrap = this._createWrap(elementName);

        SliderPanel._createLabel(labelText, elementName, propWrap);

        (<{ [key: string]: any }>this._elements)[elementName + `Input`] = SliderPanel._createInput(elementName, propWrap, isCheckbox);

        return propWrap;
    }

    /**
     * Создание инпутов для хэндлеров (проставляются ещё индексы)
     * @param handlerIndex
     * @private
     */
    private _createHandlerSection(handlerIndex: number) {
        const valueWrap = this._createWrap("value");
        SliderPanel._createLabel(`Положение ${handlerIndex + 1} `, `value`, valueWrap);
        const positionInput = SliderPanel._createInput(`value`, valueWrap) as HTMLInputElement;

        SliderPanel._createLabel(`Значение ${handlerIndex + 1} `, `item`, valueWrap);
        const itemIndexInput = SliderPanel._createElement(`div`, `item`, valueWrap) as HTMLInputElement;

        const itemDeleteButton = SliderPanel._createButton(`х`, `delete`, valueWrap);
        itemDeleteButton.addEventListener("click", () => {
            this.boundController.removeHandler(handlerIndex);
        });

        this._elements.handlerInputs.push({
            wrap: valueWrap,
            index: handlerIndex,
            positionElement: positionInput,
            itemIndexElement: itemIndexInput
        });
        this._elements.handlerInputs[this._elements.handlerInputs.length - 1]
            .positionElement.addEventListener("change", this.handlerPositionChanged);

        this._elements.body.append(valueWrap);
    }

    /**
     * Для обработки изменений, происходящих в других видах (перемещение хэндлеров на самом слайдере в данном случае)
     * @private
     */
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
        const handlerIndex = this._elements.handlerInputs.findIndex((input) => input.index === index);
        const handler = this._elements.handlerInputs[handlerIndex];

        handler.itemIndexElement.innerText = this._handlers[handlerIndex].item;
    }

    private _refreshHandlerPosition(index: number) {
        const handlerIndex = this._elements.handlerInputs.findIndex((input) => input.index === index);
        const handler = this._elements.handlerInputs[handlerIndex];

        (handler.positionElement as HTMLInputElement).value = `${this._handlers[handlerIndex].positionPart.toFixed(2)}`;
    };

    /**
     * Вызов функции контроллера для установки значения ориентации
     * @param isVertical true - вертикально, false - горизонтально
     */
    private setOrientation(isVertical: boolean) {
        this.boundController.setVertical(isVertical);
    }

    public passVisualProps(
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

        (this._elements.markupVisibilityInput as HTMLInputElement).checked =
            parameters?.withMarkup === undefined ? this._withMarkup : parameters.withMarkup;

        this._refreshElements();
    };

    public addHandler(handlerParams: { positionPart: number, value: any, handlerIndex: number, itemIndex: number }) {
        this._handlers.push({
            index: handlerParams.handlerIndex,
            positionPart: handlerParams.positionPart,
            item: handlerParams.value,
            itemIndex: handlerParams.itemIndex
        });

        this._createHandlerSection(handlerParams.handlerIndex);
        this._addHandlerRangePairOption(handlerParams.handlerIndex, handlerParams.handlerIndex);
        this._refreshElements();
    };

    public removeHandler(handlerIndex: number) {
        const handlerToRemoveIndex = this._handlers.findIndex(handler => handler.index === handlerIndex);
        this._handlers.splice(handlerToRemoveIndex, 1);

        const handlerInputToRemoveIndex = this._elements.handlerInputs.findIndex(handlerInput => handlerInput.index === handlerIndex);
        const handlerInputToRemove = this._elements.handlerInputs[handlerInputToRemoveIndex];
        handlerInputToRemove.wrap.remove();
        this._elements.handlerInputs.splice(handlerInputToRemoveIndex, 1);

        const pairSelectOptions = this._elements.newHandlerElements.handlerPairSelect.options;
        for (let option of pairSelectOptions) {
            if (option.value === handlerIndex.toString()) {
                pairSelectOptions.remove(option.index);
            }
        }
    }

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
        if (!handler)
            return;

        handler.positionPart = data.relativeValue;
        handler.item = data.item;
        this._refreshElements();
    };

    public initHandlers(handlersData: { handlersArray: { index: number, positionPart: number, value: any, valueIndex: number }[] }) {
        this._handlers = [];

        handlersData.handlersArray.forEach((handler, index) => {
            this._handlers.push({
                index: handler.index,
                positionPart: handler.positionPart,
                item: handler.value,
                itemIndex: handler.valueIndex
            });
            this._createHandlerSection(handler.index);
            this._addHandlerRangePairOption(index, index);
        });

        this._refreshElements();
    };

    public passDataProps(props: { absoluteStep: number, min: number, max: number }) {
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
