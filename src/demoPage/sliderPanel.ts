import Controller from '../controller/controller';
import {
  Listenable, View, KeyStringObj, Presentable, SliderPluginParams,
} from '../utils/interfacesAndTypes';


export default class SliderPanel implements Listenable, View {
  listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

  public boundController: Controller;

  private isVertical: boolean;

  private tooltipsAreVisible: boolean;

  private withMarkup: boolean;

  private handlers: {
    index: number; positionPart: number; item: Presentable; itemIndex: number;
  }[] = [];

  private options = new Map().set('Никем', null).set('Началом', 'start').set('Концом', 'end');

  static readonly classPrefix = 'panel__';

  private readonly elements: {
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

  constructor(private parentElement: HTMLElement) {
    this.elements = {
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
    this.createBaseElements();
    this.createNewHandlerSection();
  }

  public getBody(): HTMLElement {
    return this.elements.body;
  }

  private createBaseElements(): void {
    this.elements.wrap = this.parentElement.parentElement;

    this.elements.body = this.parentElement;
    this.elements.body.classList.add(`${SliderPanel.classPrefix}body`);

    this.createPropertyElements('Шаг', 'step');
    this.elements.stepInput.addEventListener('change', this.boundHandleStepInputChange);

    this.createPropertyElements('Минимум', 'min');
    this.elements.minInput.addEventListener('change', this.boundHandleMinInputChange);

    this.createPropertyElements('Максимум', 'max');
    this.elements.maxInput.addEventListener('change', this.boundHandleMaxInputChange);

    this.createPropertyElements('Вертикальный?', 'orientation', true);
    this.elements.orientationInput.addEventListener('change', this.boundHandleOrientationInputChange);

    this.createPropertyElements('Тултипы видны?', 'tooltipsVisibility', true);
    this.elements.tooltipsVisibilityInput.addEventListener('change', this.boundHandleTooltipVisibilityInputChange);

    this.createPropertyElements('Разметка видна?', 'markupVisibility', true);
    this.elements.markupVisibilityInput.addEventListener('change', this.boundMarkupInputChange);
  }

  private boundNewHandlerElementsClick = this.newHandlerElementsClick.bind(this);

  private newHandlerElementsClick(): void {
    const itemIndex = Number.parseFloat(this.elements.newHandlerElements.itemIndexInput.value);
    if (Number.isNaN(itemIndex)) return;

    const rangePair = this.options
      .get(this.elements.newHandlerElements.handlerPairSelect.selectedOptions[0].text);

    this.boundController.addHandler(itemIndex, rangePair);
  }

  private boundMarkupInputChange = this.handleMarkupInputChange.bind(this);

  private handleMarkupInputChange(event: Event): void {
    this.withMarkup = (event.target as HTMLInputElement).checked;

    this.boundController.setMarkupVisibility(this.withMarkup);
  }

  private boundHandleOrientationInputChange = this.handleOrientationInputChange.bind(this);

  private handleOrientationInputChange(event: Event): void {
    this.setOrientation((event.target as HTMLInputElement).checked);
  }

  private boundHandleStepInputChange = this.handleStepInputChange.bind(this);

  private handleStepInputChange(): void {
    const { stepInput } = this.elements;
    this.boundController.setStep(Number.parseFloat(stepInput.value));
  }

  private boundHandleMinInputChange = this.handleMinInputChange.bind(this);

  private handleMinInputChange(): void {
    const { minInput } = this.elements;
    this.boundController.setMin(Number.parseFloat(minInput.value));
  }

  private boundHandleTooltipVisibilityInputChange =
      this.handleTooltipVisibilityInputChange.bind(this);

  private handleTooltipVisibilityInputChange(): void {
    const tooltipVisibilityInput = this.elements.tooltipsVisibilityInput;
    this.tooltipsAreVisible = tooltipVisibilityInput.checked;
    this.boundController.setTooltipVisibility(tooltipVisibilityInput.checked);
  }

  private boundHandleMaxInputChange = this.handleMaxInputChange.bind(this);

  private handleMaxInputChange(): void {
    const { maxInput } = this.elements;
    this.boundController.setMax(Number.parseFloat(maxInput.value));
  }

  private createNewHandlerSection(): void {
    const baseClass = 'newHandler';

    const newHandlerWrap = this.createWrap('newHandler');

    SliderPanel.createLabel('Значение', baseClass, newHandlerWrap);
    const newHandlerInput = SliderPanel.createInput(baseClass, newHandlerWrap);

    SliderPanel.createLabel('Соединить с...', baseClass, newHandlerWrap);
    const newHandlerPairSelect = document.createElement('select');
    newHandlerPairSelect.classList.add(`${SliderPanel.classPrefix}newHandlerPairSelect`);
    newHandlerWrap.append(newHandlerPairSelect);

    const newHandlerButton = document.createElement('button');
    newHandlerButton.innerText = 'Создать \n новый хэндлер';
    newHandlerButton.classList.add(`${SliderPanel.classPrefix}newHandlerButton`);
    newHandlerButton.addEventListener('click', this.boundNewHandlerElementsClick);
    newHandlerWrap.append(newHandlerButton);

    this.elements.newHandlerElements = {
      itemIndexInput: newHandlerInput,
      createButton: newHandlerButton,
      handlerPairSelect: newHandlerPairSelect,
    };
    this.fillHandlerBindingSelect();
  }

  private fillHandlerBindingSelect(): void {
    this.options.forEach((optionValue, optionKey) => {
      this.addHandlerRangePairOption(optionKey, optionValue);
    });
  }

  private addHandlerRangePairOption(
    optionKey: number | string, optionValue: number | string,
  ): void {
    const { handlerPairSelect } = this.elements.newHandlerElements;

    let textToShow: string;
    if (typeof optionKey === 'number') {
      textToShow = (optionKey + 1).toString();
    } else {
      textToShow = optionKey;
    }

    this.options.set(textToShow, optionValue);

    const optionElement = document.createElement('option');
    optionElement.value = optionKey.toString();
    optionElement.innerText = textToShow;

    handlerPairSelect.options.add(optionElement);
  }

  private static createElement(
    elementName: string, classPostfix: string, wrap?: HTMLElement,
  ): HTMLElement {
    const propElement = document.createElement(elementName);
    propElement.classList.add(SliderPanel.classPrefix + classPostfix);

    if (wrap) wrap.append(propElement);

    return propElement;
  }

  private createWrap(elementClassName: string): HTMLElement {
    return SliderPanel.createElement('div', `${elementClassName}Wrap`, this.elements.body);
  }

  private static createLabel(
    labelText: string, elementClassName: string, wrap?: HTMLElement,
  ): HTMLElement {
    const propLabel = SliderPanel.createElement(
      'label', `${elementClassName}Label`, wrap,
    );
    propLabel.innerText = labelText;

    return propLabel;
  }

  private static createInput(
    elementClassName: string, wrap?: HTMLElement, isCheckbox?: boolean,
  ): HTMLInputElement {
    const propInput = SliderPanel.createElement('input', `${elementClassName}Input`, wrap);

    if (isCheckbox) propInput.setAttribute('type', 'checkbox');

    return (propInput as HTMLInputElement);
  }

  private static createButton(
    text: string, elementClassName: string, wrap?: HTMLElement,
  ): HTMLButtonElement {
    const newButton = this.createElement('button', `${elementClassName}Button`, wrap) as HTMLButtonElement;
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
  private createPropertyElements(
    labelText: string, elementName: string, isCheckbox?: boolean,
  ): HTMLElement {
    const propWrap = this.createWrap(elementName);

    SliderPanel.createLabel(labelText, elementName, propWrap);

    (this.elements as KeyStringObj)[`${elementName}Input`] = SliderPanel.createInput(elementName, propWrap, isCheckbox);

    return propWrap;
  }

  /**
   * Создание инпутов для хэндлеров (проставляются ещё индексы)
   * @param handlerIndex
   * @private
   */
  private createHandlerSection(handlerIndex: number): void {
    const valueWrap = this.createWrap('value');
    SliderPanel.createLabel(`Положение ${handlerIndex + 1} `, 'value', valueWrap);
    const positionInput = SliderPanel.createInput('value', valueWrap) as HTMLInputElement;

    SliderPanel.createLabel(`Значение ${handlerIndex + 1} `, 'item', valueWrap);
    const itemIndexInput = SliderPanel.createElement('div', 'item', valueWrap) as HTMLInputElement;

    const itemDeleteButton = SliderPanel.createButton('х', 'delete', valueWrap);
    const handleItemDeleteButtonClick = (): void => {
      this.boundController.removeHandler(handlerIndex);
    };
    itemDeleteButton.addEventListener('click', handleItemDeleteButtonClick);

    this.elements.handlerInputs.push({
      wrap: valueWrap,
      index: handlerIndex,
      positionElement: positionInput,
      itemIndexElement: itemIndexInput,
    });
    this.elements.handlerInputs[this.elements.handlerInputs.length - 1]
      .positionElement.addEventListener('change', this.handlePositionInputChange);

    this.elements.body.append(valueWrap);
  }

  private handlePositionInputChange = (event: Event): void => {
    const valueInput = (event.target as HTMLInputElement);
    const inputIndex = this.elements.handlerInputs
      .find((input) => input.positionElement === valueInput)
      .index;

    this.handleHandlerPositionChanged(inputIndex, Number.parseFloat(valueInput.value));
  }

  /**
   * Для обработки изменений, происходящих в других видах
   * (перемещение хэндлеров на самом слайдере в данном случае)
   * @private
   */
  private refreshElements(): void {
    this.refreshOrientation();
    this.refreshMarkupVisibility();
    this.refreshTooltipVisibility();

    this.handlers.forEach((handler) => {
      this.refreshHandlerPosition(handler.index);
      this.refreshHandlerItem(handler.index);
    });
  }

  private refreshMarkupVisibility(): void {
    this.elements.markupVisibilityInput.checked = this.withMarkup;
  }

  private refreshTooltipVisibility(): void {
    this.elements.tooltipsVisibilityInput.checked = this.tooltipsAreVisible;
  }

  private refreshOrientation(): void {
    this.elements.wrap.classList.add(this.isVertical ? 'vertical' : 'horizontal');
    this.elements.wrap.classList.remove(this.isVertical ? 'horizontal' : 'vertical');

    this.elements.orientationInput.checked = this.isVertical;
  }

  private refreshHandlerItem(index: number): void {
    const handlerIndex = this.elements.handlerInputs.findIndex((input) => input.index === index);
    const handler = this.elements.handlerInputs[handlerIndex];

    handler.itemIndexElement.innerText = this.handlers[handlerIndex].item?.toString();
  }

  private refreshHandlerPosition(index: number): void {
    const handlerIndex = this.elements.handlerInputs.findIndex((input) => input.index === index);
    const handler = this.elements.handlerInputs[handlerIndex];

    (handler.positionElement as HTMLInputElement).value = `${this.handlers[handlerIndex].positionPart.toFixed(2)}`;
  }

  /**
   * Вызов функции контроллера для установки значения ориентации
   * @param isVertical true - вертикально, false - горизонтально
   */
  private setOrientation(isVertical: boolean): void {
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
      this.isVertical = parameters.isVertical;
    }

    if (parameters?.withMarkup !== undefined && parameters?.withMarkup !== null) {
      this.withMarkup = parameters.withMarkup;
    }

    if (parameters?.showTooltips !== undefined && parameters?.showTooltips !== null) {
      this.tooltipsAreVisible = parameters.showTooltips;
    }

    this.refreshElements();
  }

  public addHandler(
    handlerParams: {
          positionPart: number; item: Presentable; handlerIndex: number; itemIndex: number;
      },
  ): void {
    this.handlers.push({
      index: handlerParams.handlerIndex,
      positionPart: handlerParams.positionPart,
      item: handlerParams.item,
      itemIndex: handlerParams.itemIndex,
    });

    this.createHandlerSection(handlerParams.handlerIndex);
    this.addHandlerRangePairOption(handlerParams.handlerIndex, handlerParams.handlerIndex);
    this.refreshElements();
  }

  public removeHandler(handlerIndex: number): void {
    const handlerToRemoveIndex = this.handlers.findIndex(
      (handler) => handler.index === handlerIndex,
    );
    this.handlers.splice(handlerToRemoveIndex, 1);

    const handlerInputToRemoveIndex = this.elements.handlerInputs.findIndex(
      (handlerInput) => handlerInput.index === handlerIndex,
    );
    const handlerInputToRemove = this.elements.handlerInputs[handlerInputToRemoveIndex];
    handlerInputToRemove.wrap.remove();
    this.elements.handlerInputs.splice(handlerInputToRemoveIndex, 1);

    const pairSelectOptions = this.elements.newHandlerElements.handlerPairSelect.options;
    Object.entries(pairSelectOptions).forEach((option, index) => {
      if (option[1].innerText === (handlerIndex + 1).toString()) {
        pairSelectOptions.remove(index);
      }
    });
  }

  public handleHandlerPositionChanged(
    handlerIndex: number,
    standardizedPosition: number,
  ): { view: View; index: number; position: number } {
    return { view: this, index: handlerIndex, position: standardizedPosition };
  }

  public handlersValuesChangedListener(
    data: { index: number; relativeValue: number; item: Presentable },
  ): void {
    if (data === null) return;

    const changedHandler = this.handlers.find((handler) => handler.index === data.index);
    if (!changedHandler) return;

    changedHandler.positionPart = data.relativeValue;
    changedHandler.item = data.item;
    this.refreshElements();
  }

  public initHandlers(
    handlersData: {
          handlersArray: {
              handlerIndex: number; positionPart: number; item: Presentable; itemIndex: number;
          }[];
      },
  ): void {
    this.handlers = [];

    handlersData.handlersArray.forEach((handler, index) => {
      this.handlers.push({
        index: handler.handlerIndex,
        positionPart: handler.positionPart,
        item: handler.item,
        itemIndex: handler.itemIndex,
      });
      this.createHandlerSection(handler.handlerIndex);
      this.addHandlerRangePairOption(index, index);
    });

    this.refreshElements();
  }

  public passDataProps(props: { absoluteStep: number; min: number; max: number }): void {
    const maxInput = (this.elements.maxInput as HTMLInputElement);
    if (!maxInput.value) {
      maxInput.value = props.max.toFixed(2);
    }
    const minInput = (this.elements.minInput as HTMLInputElement);
    if (!minInput.value) {
      minInput.value = props.min.toFixed(2);
    }
    const stepInput = (this.elements.stepInput as HTMLInputElement);
    if (!stepInput.value) {
      stepInput.value = props.absoluteStep.toFixed(2);
    }
  }
}
