import Controller from '../controller/controller';
import {
  Listenable, View, KeyStringObj, Presentable, SliderPluginParams,
} from '../utils/interfacesAndTypes';
import {
  createButton, createElement, createInput, createLabel,
} from '../utils/functions';

import './sliderPanel.scss';

export default class SliderPanel implements Listenable, View {
  listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

  private sliderController: Controller;

  private isVertical: boolean;

  private tooltipsAreVisible: boolean;

  private withMarkup: boolean;

  private handlers: {
    index: number; positionPart: number; item: Presentable; itemIndex: number;
  }[] = [];

  private readonly rangePairOptions = new Map()
    .set('Никем', null).set('Началом', 'start').set('Концом', 'end');

  static readonly classPrefix = 'panel';

  private readonly elements = {
    wrap: null as HTMLElement,
    body: null as HTMLElement,
    handlerInputs: [] as {
      wrap: HTMLElement;
      index: number;
      positionElement: HTMLInputElement;
      itemIndexElement: HTMLInputElement;
    }[],
    maxInput: null as HTMLInputElement,
    minInput: null as HTMLInputElement,
    stepInput: null as HTMLInputElement,
    orientationInput: null as HTMLInputElement,
    tooltipsVisibilityInput: null as HTMLInputElement,
    markupVisibilityInput: null as HTMLInputElement,
    newHandlerElements: null as {
      itemIndexInput: HTMLInputElement;
      createButton: HTMLButtonElement;
      handlerPairSelect: HTMLSelectElement;
    },
  };

  constructor(private parentElement: HTMLElement) {
    this.createBaseElements();
    this.createNewHandlerSection();
  }

  public getBody(): HTMLElement {
    return this.elements.body;
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

  public initSlider(element: HTMLElement | JQuery, sliderParams?: SliderPluginParams): void {
    this.sliderController = $(element).liquidSlider(sliderParams);
    this.sliderController.addView(this);
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

  private createBaseElements(): void {
    this.elements.wrap = this.parentElement;

    this.elements.body = createElement('section', 'panel__body');
    this.elements.wrap.prepend(this.elements.body);

    this.createPropertyElements('stepInput', 'step', 'Шаг');
    this.elements.stepInput.addEventListener('change', this.handleStepInputChange);

    this.createPropertyElements('minInput', 'min', 'Минимум');
    this.elements.minInput.addEventListener('change', this.handleMinInputChange);

    this.createPropertyElements('maxInput', 'max', 'Максимум');
    this.elements.maxInput.addEventListener('change', this.handleMaxInputChange);

    this.createPropertyElements('orientationInput', 'orientation', 'Вертикальный?', true);
    this.elements.orientationInput.addEventListener('change', this.handleOrientationInputChange);

    this.createPropertyElements('tooltipsVisibilityInput', 'tooltips-visibility', 'Тултипы видны?', true);
    this.elements.tooltipsVisibilityInput.addEventListener('change', this.handleTooltipVisibilityInputChange);

    this.createPropertyElements('markupVisibilityInput', 'markup-visibility', 'Разметка видна?', true);
    this.elements.markupVisibilityInput.addEventListener('change', this.handleMarkupInputChange);
  }

  private newHandlerElementsClick = (): void => {
    const itemIndex = Number.parseFloat(this.elements.newHandlerElements.itemIndexInput.value);
    if (Number.isNaN(itemIndex)) return;

    const rangePair = this.rangePairOptions
      .get(this.elements.newHandlerElements.handlerPairSelect.selectedOptions[0].text);

    this.sliderController.addHandler(itemIndex, rangePair);
  }

  private handleMarkupInputChange = (event: Event): void => {
    this.withMarkup = (event.target as HTMLInputElement).checked;

    this.sliderController.setMarkupVisibility(this.withMarkup);
  }

  private handleOrientationInputChange = (event: Event): void => {
    this.setOrientation((event.target as HTMLInputElement).checked);
  }

  private handleStepInputChange = (): void => {
    const { stepInput } = this.elements;
    this.sliderController.setStep(Number.parseFloat(stepInput.value));
  }

  private handleMinInputChange = (): void => {
    const { minInput } = this.elements;
    this.sliderController.setMin(Number.parseFloat(minInput.value));
  }

  private handleTooltipVisibilityInputChange = (): void => {
    const tooltipVisibilityInput = this.elements.tooltipsVisibilityInput;
    this.tooltipsAreVisible = tooltipVisibilityInput.checked;
    this.sliderController.setTooltipVisibility(tooltipVisibilityInput.checked);
  }

  private handleMaxInputChange = (): void => {
    const { maxInput } = this.elements;
    this.sliderController.setMax(Number.parseFloat(maxInput.value));
  }

  private createNewHandlerSection(): void {
    const baseClass = 'new-handler';

    const newHandlerWrap = this.createWrap(baseClass);

    createLabel('Значение', `${SliderPanel.classPrefix}__${baseClass}-label`, newHandlerWrap);
    const newHandlerInput = createInput(`${SliderPanel.classPrefix}__${baseClass}-input`, newHandlerWrap);

    createLabel('Соединить с...', `${SliderPanel.classPrefix}__${baseClass}-label`, newHandlerWrap);
    const newHandlerPairSelect = document.createElement('select');
    newHandlerPairSelect.classList.add(`${SliderPanel.classPrefix}__${baseClass}-pair-select`);
    newHandlerWrap.append(newHandlerPairSelect);

    const newHandlerButton = document.createElement('button');
    newHandlerButton.innerText = 'Создать \n новый хэндлер';
    newHandlerButton.classList.add(`${SliderPanel.classPrefix}__${baseClass}-button`);
    newHandlerButton.addEventListener('click', this.newHandlerElementsClick);
    newHandlerWrap.append(newHandlerButton);

    this.elements.newHandlerElements = {
      itemIndexInput: newHandlerInput,
      createButton: newHandlerButton,
      handlerPairSelect: newHandlerPairSelect,
    };
    this.fillHandlerBindingSelect();
  }

  private fillHandlerBindingSelect(): void {
    this.rangePairOptions.forEach((optionValue, optionKey) => {
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

    this.rangePairOptions.set(textToShow, optionValue);

    const optionElement = document.createElement('option');
    optionElement.value = optionKey.toString();
    optionElement.innerText = textToShow;

    handlerPairSelect.options.add(optionElement);
  }

  private createWrap(elementClassName: string): HTMLElement {
    return createElement('div', `${SliderPanel.classPrefix}__${elementClassName}`, this.elements.body);
  }

  private createPropertyElements(
    elementPropName: string, elementClassName: string, labelText?: string, isCheckbox?: boolean,
  ): HTMLElement {
    const propWrap = this.createWrap(elementClassName);

    if (labelText) {
      createLabel(labelText, `${SliderPanel.classPrefix}__${elementClassName}-label`, propWrap);
    }

    (this.elements as KeyStringObj)[elementPropName] = createInput(
      `${SliderPanel.classPrefix}__${elementClassName}-input`, propWrap, isCheckbox,
    );

    return propWrap;
  }

  private createHandlerSection(handlerIndex: number): void {
    const valueWrap = this.createWrap('value');
    createLabel(`Положение ${handlerIndex + 1} `, `${SliderPanel.classPrefix}__value-label`, valueWrap);
    const positionInput = createInput(`${SliderPanel.classPrefix}__value-input`, valueWrap) as HTMLInputElement;

    createLabel(`Значение ${handlerIndex + 1} `, `${SliderPanel.classPrefix}__item-label`, valueWrap);
    const itemIndexInput = createElement('div', `${SliderPanel.classPrefix}__item`, valueWrap) as HTMLInputElement;

    const itemDeleteButton = createButton('х', `${SliderPanel.classPrefix}__delete-Button`, valueWrap);
    const handleItemDeleteButtonClick = (): void => {
      this.sliderController.removeHandler(handlerIndex);
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
    const orientationModifier = `${SliderPanel.classPrefix}_${this.isVertical ? 'vertical' : 'horizontal'}`;
    const oldOrientationModifier = `${SliderPanel.classPrefix}_${this.isVertical ? 'horizontal' : 'vertical'}`;

    this.elements.wrap.classList.add(orientationModifier);
    this.elements.wrap.classList.remove(oldOrientationModifier);

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

  private setOrientation(isVertical: boolean): void {
    this.sliderController.setVertical(isVertical);
  }
}
