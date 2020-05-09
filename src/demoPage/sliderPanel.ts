import { Listenable } from '../utils/common';
import Controller from '../controller/controller';
import { View } from '../utils/interfaces';
import { KeyStringObj, Presentable } from '../utils/types';

export default class SliderPanel implements Listenable, View {
    listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

    public boundController: Controller;

    private _isVertical: boolean;

    private _tooltipsAreVisible: boolean;

    private _withMarkup: boolean;

    private _handlers: {
      index: number; positionPart: number; item: Presentable; itemIndex: number;
    }[] = [];

    private _options = new Map().set('Никем', null).set('Началом', 'start').set('Концом', 'end');

    static readonly classPrefix = 'panel__';

    private readonly _elements: {
        wrap: HTMLElement; body: HTMLElement;
        handlerInputs:
            {
                wrap: HTMLElement;
                index: number;
                positionElement: HTMLInputElement;
                itemIndexElement: HTMLInputElement;
            }[];
        maxInput: HTMLInputElement;
        minInput: HTMLInputElement;
        stepInput: HTMLInputElement;
        orientationInput: HTMLInputElement;
        tooltipsVisibilityInput: HTMLInputElement;
        markupVisibilityInput: HTMLInputElement;
        newHandlerElements:
            {
                itemIndexInput: HTMLInputElement;
                createButton: HTMLButtonElement;
                handlerPairSelect: HTMLSelectElement;
            };
    };

    get body(): HTMLElement {
      return this._elements.body;
    }

    constructor(private _parentElement: HTMLElement) {
      this._elements = {
        wrap: undefined,
        body: undefined,
        handlerInputs: [],
        maxInput: undefined,
        minInput: undefined,
        stepInput: undefined,
        orientationInput: undefined,
        tooltipsVisibilityInput: undefined,
        markupVisibilityInput: undefined,
        newHandlerElements: undefined,
      };
      this._createBaseElements();
      this._createNewHandlerSection();
    }

    private _createBaseElements(): void {
      this._elements.wrap = this._parentElement.parentElement;

      this._elements.body = this._parentElement;
      this._elements.body.classList.add(`${SliderPanel.classPrefix}body`);

      this._createPropertyElements('Шаг', 'step');
      this._elements.stepInput.addEventListener('change', this._boundHandleStepInputChange);

      this._createPropertyElements('Минимум', 'min');
      this._elements.minInput.addEventListener('change', this._boundHandleMinInputChange);

      this._createPropertyElements('Максимум', 'max');
      this._elements.maxInput.addEventListener('change', this._boundHandleMaxInputChange);

      this._createPropertyElements('Вертикальный?', 'orientation', true);
      this._elements.orientationInput.addEventListener('change', this._boundHandleOrientationInputChange);

      this._createPropertyElements('Тултипы видны?', 'tooltipsVisibility', true);
      this._elements.tooltipsVisibilityInput.addEventListener('change', this._boundHandleTooltipVisibilityInputChange);

      this._createPropertyElements('Разметка видна?', 'markupVisibility', true);
      this._elements.markupVisibilityInput.addEventListener('change', this._boundMarkupInputChange);
    }

    private _boundNewHandlerElementsClick = this._newHandlerElementsClick.bind(this);

    private _newHandlerElementsClick(): void {
      const itemIndex = Number.parseFloat(this._elements.newHandlerElements.itemIndexInput.value);
      if (Number.isNaN(itemIndex)) return;

      const rangePair = this._options
        .get(this._elements.newHandlerElements.handlerPairSelect.selectedOptions[0].text);

      this.boundController.addHandler(itemIndex, rangePair);
    }

    private _boundMarkupInputChange = this._handleMarkupInputChange.bind(this);

    private _handleMarkupInputChange(event: Event): void {
      this._withMarkup = (event.target as HTMLInputElement).checked;

      this.boundController.setMarkupVisibility(this._withMarkup);
    }

    private _boundHandleOrientationInputChange = this._handleOrientationInputChange.bind(this);

    private _handleOrientationInputChange(event: Event): void {
      this._setOrientation((event.target as HTMLInputElement).checked);
    }

    private _boundHandleStepInputChange = this._handleStepInputChange.bind(this);

    private _handleStepInputChange(): void {
      const { stepInput } = this._elements;
      this.boundController.setStep(Number.parseFloat(stepInput.value));
    }

    private _boundHandleMinInputChange = this._handleMinInputChange.bind(this);

    private _handleMinInputChange(): void {
      const { minInput } = this._elements;
      this.boundController.setMin(Number.parseFloat(minInput.value));
    }

    private _boundHandleTooltipVisibilityInputChange =
        this._handleTooltipVisibilityInputChange.bind(this);

    private _handleTooltipVisibilityInputChange(): void {
      const tooltipVisibilityInput = this._elements.tooltipsVisibilityInput;
      this._tooltipsAreVisible = tooltipVisibilityInput.checked;
      this.boundController.setTooltipVisibility(tooltipVisibilityInput.checked);
    }

    private _boundHandleMaxInputChange = this._handleMaxInputChange.bind(this);

    private _handleMaxInputChange(): void {
      const { maxInput } = this._elements;
      this.boundController.setMax(Number.parseFloat(maxInput.value));
    }

    private _createNewHandlerSection(): void {
      const baseClass = 'newHandler';

      const newHandlerWrap = this._createWrap('newHandler');

      SliderPanel._createLabel('Значение', baseClass, newHandlerWrap);
      const newHandlerInput = SliderPanel._createInput(baseClass, newHandlerWrap);

      SliderPanel._createLabel('Соединить с...', baseClass, newHandlerWrap);
      const newHandlerPairSelect = document.createElement('select');
      newHandlerPairSelect.classList.add(`${SliderPanel.classPrefix}newHandlerPairSelect`);
      newHandlerWrap.append(newHandlerPairSelect);

      const newHandlerButton = document.createElement('button');
      newHandlerButton.innerText = 'Создать \n новый хэндлер';
      newHandlerButton.classList.add(`${SliderPanel.classPrefix}newHandlerButton`);
      newHandlerButton.addEventListener('click', this._boundNewHandlerElementsClick);
      newHandlerWrap.append(newHandlerButton);

      this._elements.newHandlerElements = {
        itemIndexInput: newHandlerInput,
        createButton: newHandlerButton,
        handlerPairSelect: newHandlerPairSelect,
      };
      this._fillHandlerBindingSelect();
    }

    private _fillHandlerBindingSelect(): void {
      this._options.forEach((optionValue, optionKey) => {
        this._addHandlerRangePairOption(optionKey, optionValue);
      });
    }

    private _addHandlerRangePairOption(
      optionKey: number | string, optionValue: number | string,
    ): void {
      const { handlerPairSelect } = this._elements.newHandlerElements;

      let textToShow: string;
      if (typeof optionKey === 'number') {
        textToShow = (optionKey + 1).toString();
      } else {
        textToShow = optionKey;
      }

      this._options.set(textToShow, optionValue);

      const optionElement = document.createElement('option');
      optionElement.value = optionKey.toString();
      optionElement.innerText = textToShow;

      handlerPairSelect.options.add(optionElement);
    }

    private static _createElement(
      elementName: string, classPostfix: string, wrap?: HTMLElement,
    ): HTMLElement {
      const propElement = document.createElement(elementName);
      propElement.classList.add(SliderPanel.classPrefix + classPostfix);

      if (wrap) wrap.append(propElement);

      return propElement;
    }

    private _createWrap(elementClassName: string): HTMLElement {
      return SliderPanel._createElement('div', `${elementClassName}Wrap`, this._elements.body);
    }

    private static _createLabel(
      labelText: string, elementClassName: string, wrap?: HTMLElement,
    ): HTMLElement {
      const propLabel = SliderPanel._createElement(
        'label', `${elementClassName}Label`, wrap,
      );
      propLabel.innerText = labelText;

      return propLabel;
    }

    private static _createInput(
      elementClassName: string, wrap?: HTMLElement, isCheckbox?: boolean,
    ): HTMLInputElement {
      const propInput = SliderPanel._createElement('input', `${elementClassName}Input`, wrap);

      if (isCheckbox) propInput.setAttribute('type', 'checkbox');

      return (propInput as HTMLInputElement);
    }

    private static _createButton(
      text: string, elementClassName: string, wrap?: HTMLElement,
    ): HTMLButtonElement {
      const newButton = this._createElement('button', `${elementClassName}Button`, wrap) as HTMLButtonElement;
      newButton.innerText = text;

      return newButton;
    }

    /**
     * Создаёт элементы для свойств (обёртка, лейбл и инпут) и вставляет в обёртку панели.
     * Возвращает обёртку
     * @param labelText - текст, который будет записан в лейбле
     * @param elementName - имя элемента для указания класса (step, value и т.д.)
     * @param isCheckbox если true, то инпут будет чекбоксом
     * @private
     */
    private _createPropertyElements(
      labelText: string, elementName: string, isCheckbox?: boolean,
    ): HTMLElement {
      const propWrap = this._createWrap(elementName);

      SliderPanel._createLabel(labelText, elementName, propWrap);

      (this._elements as KeyStringObj)[`${elementName}Input`] = SliderPanel._createInput(elementName, propWrap, isCheckbox);

      return propWrap;
    }

    /**
     * Создание инпутов для хэндлеров (проставляются ещё индексы)
     * @param handlerIndex
     * @private
     */
    private _createHandlerSection(handlerIndex: number): void {
      const valueWrap = this._createWrap('value');
      SliderPanel._createLabel(`Положение ${handlerIndex + 1} `, 'value', valueWrap);
      const positionInput = SliderPanel._createInput('value', valueWrap) as HTMLInputElement;

      SliderPanel._createLabel(`Значение ${handlerIndex + 1} `, 'item', valueWrap);
      const itemIndexInput = SliderPanel._createElement('div', 'item', valueWrap) as HTMLInputElement;

      const itemDeleteButton = SliderPanel._createButton('х', 'delete', valueWrap);
      const handleItemDeleteButtonClick = (): void => {
        this.boundController.removeHandler(handlerIndex);
      };
      itemDeleteButton.addEventListener('click', handleItemDeleteButtonClick);

      this._elements.handlerInputs.push({
        wrap: valueWrap,
        index: handlerIndex,
        positionElement: positionInput,
        itemIndexElement: itemIndexInput,
      });
      this._elements.handlerInputs[this._elements.handlerInputs.length - 1]
        .positionElement.addEventListener('change', this._handlePositionInputChange);

      this._elements.body.append(valueWrap);
    }

    private _handlePositionInputChange(event: Event): void {
      const valueInput = (event.target as HTMLInputElement);
      const inputIndex = this._elements.handlerInputs
        .find((input) => input.positionElement === valueInput)
        .index;

      this.handlerPositionChanged(inputIndex, Number.parseFloat(valueInput.value));
    }

    /**
     * Для обработки изменений, происходящих в других видах
     * (перемещение хэндлеров на самом слайдере в данном случае)
     * @private
     */
    private _refreshElements(): void {
      this._refreshOrientation();
      this._refreshMarkupVisibility();
      this._refreshTooltipVisibility();

      this._handlers.forEach((handler) => {
        this._refreshHandlerPosition(handler.index);
        this._refreshHandlerItem(handler.index);
      });
    }

    private _refreshMarkupVisibility(): void {
      this._elements.markupVisibilityInput.checked = this._withMarkup;
    }

    private _refreshTooltipVisibility(): void {
      this._elements.tooltipsVisibilityInput.checked = this._tooltipsAreVisible;
    }

    private _refreshOrientation(): void {
      this._elements.wrap.classList.add(this._isVertical ? 'vertical' : 'horizontal');
      this._elements.wrap.classList.remove(this._isVertical ? 'horizontal' : 'vertical');

      // отображение значения вертикальности на чекбоксе
      this._elements.orientationInput.checked = this._isVertical;
    }

    private _refreshHandlerItem(index: number): void {
      const handlerIndex = this._elements.handlerInputs.findIndex((input) => input.index === index);
      const handler = this._elements.handlerInputs[handlerIndex];

      handler.itemIndexElement.innerText = this._handlers[handlerIndex].item.toString();
    }

    private _refreshHandlerPosition(index: number): void {
      const handlerIndex = this._elements.handlerInputs.findIndex((input) => input.index === index);
      const handler = this._elements.handlerInputs[handlerIndex];

      (handler.positionElement as HTMLInputElement).value = `${this._handlers[handlerIndex].positionPart.toFixed(2)}`;
    }

    /**
     * Вызов функции контроллера для установки значения ориентации
     * @param isVertical true - вертикально, false - горизонтально
     */
    private _setOrientation(isVertical: boolean): void {
      this.boundController.setVertical(isVertical);
    }

    public passVisualProps(
      parameters?: {
            isVertical?: boolean;
            showTooltips?: boolean;
            isReversed?: boolean;
            withMarkup?: boolean;
        },
    ): void {
      if (parameters?.isVertical !== undefined && parameters?.isVertical !== null) {
        this._isVertical = parameters.isVertical;
      }

      if (parameters?.withMarkup !== undefined && parameters?.withMarkup !== null) {
        this._withMarkup = parameters.withMarkup;
      }

      if (parameters?.showTooltips !== undefined && parameters?.showTooltips !== null) {
        this._tooltipsAreVisible = parameters.showTooltips;
      }

      this._refreshElements();
    }

    public addHandler(
      handlerParams: {
            positionPart: number; item: Presentable; handlerIndex: number; itemIndex: number;
        },
    ): void {
      this._handlers.push({
        index: handlerParams.handlerIndex,
        positionPart: handlerParams.positionPart,
        item: handlerParams.item,
        itemIndex: handlerParams.itemIndex,
      });

      this._createHandlerSection(handlerParams.handlerIndex);
      this._addHandlerRangePairOption(handlerParams.handlerIndex, handlerParams.handlerIndex);
      this._refreshElements();
    }

    public removeHandler(handlerIndex: number): void {
      const handlerToRemoveIndex = this._handlers.findIndex(
        (handler) => handler.index === handlerIndex,
      );
      this._handlers.splice(handlerToRemoveIndex, 1);

      const handlerInputToRemoveIndex = this._elements.handlerInputs.findIndex(
        (handlerInput) => handlerInput.index === handlerIndex,
      );
      const handlerInputToRemove = this._elements.handlerInputs[handlerInputToRemoveIndex];
      handlerInputToRemove.wrap.remove();
      this._elements.handlerInputs.splice(handlerInputToRemoveIndex, 1);

      const pairSelectOptions = this._elements.newHandlerElements.handlerPairSelect.options;
      Object.entries(pairSelectOptions).forEach((option, index) => {
        if (option[1].innerText === (handlerIndex + 1).toString()) {
          pairSelectOptions.remove(index);
        }
      });
    }

    public handlerPositionChanged(
      handlerIndex: number,
      standardizedPosition: number,
    ): { view: View; index: number; position: number } {
      return { view: this, index: handlerIndex, position: standardizedPosition };
    }

    public handlersValuesChangedListener(
      data: { index: number; relativeValue: number; item: Presentable },
    ): void {
      if (data === null) return;

      const changedHandler = this._handlers.find((handler) => handler.index === data.index);
      if (!changedHandler) return;

      changedHandler.positionPart = data.relativeValue;
      changedHandler.item = data.item;
      this._refreshElements();
    }

    public initHandlers(
      handlersData: {
            handlersArray: {
                handlerIndex: number; positionPart: number; item: Presentable; itemIndex: number;
            }[];
        },
    ): void {
      this._handlers = [];

      handlersData.handlersArray.forEach((handler, index) => {
        this._handlers.push({
          index: handler.handlerIndex,
          positionPart: handler.positionPart,
          item: handler.item,
          itemIndex: handler.itemIndex,
        });
        this._createHandlerSection(handler.handlerIndex);
        this._addHandlerRangePairOption(index, index);
      });

      this._refreshElements();
    }

    public passDataProps(props: { absoluteStep: number; min: number; max: number }): void {
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
    }
}
