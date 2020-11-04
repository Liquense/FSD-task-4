import './slider-panel.scss';

import { SliderPluginParams } from '../../plugin/types';
import { HandlerModelData, SliderModelParams } from '../../model/types';
import { SliderViewParams } from '../../view/types';

import CreateHandlerSection from '../create-handler-section/create-handler-section';
import initCreateHandlerSection from '../create-handler-section/init';
import HandlerSection from '../handler-section/handler-section';
import initHandlerSection from '../handler-section/init';
import PanelProperty from '../panel-property/panel-property';
import initPanelProperty from '../panel-property/init';
import initSliders from '../slider/init';
import Slider from '../slider/slider';
import { PanelElements, PanelProperties } from './types';

class SliderPanel {
  public static readonly DEFAULT_CLASS = 'slider-panel';

  private slider: Slider;

  private isVertical: boolean;

  private isTooltipsVisible: boolean;

  private withMarkup: boolean;

  private handlers: HandlerSection[] = [];

  private readonly elements: PanelElements = {
    wrap: null,
    body: null,
    handlersSection: null,
    createHandlerSection: null,
  };

  private readonly properties: PanelProperties = {
    max: null,
    min: null,
    step: null,
    orientation: null,
    tooltipsVisibility: null,
    markupVisibility: null,
  }

  private readonly handlerCreationSection: CreateHandlerSection = null;

  constructor(private parentElement: HTMLElement) {
    this.initElements(parentElement);
    this.initProperties();
    [this.handlerCreationSection] = initCreateHandlerSection(this.elements.createHandlerSection);
    this.initEventHandlers();
  }

  public initSlider(sliderParams?: SliderPluginParams): void {
    const $element = $(this.elements.wrap).find(`.js-${SliderPanel.DEFAULT_CLASS}__slider`);
    const [slider] = initSliders($element, sliderParams);

    this.slider = slider;
    this.slider.callPluginFunction('addAfterHandlerValueChangedListener', this.handleHandlerValueChange);
    this.slider.callPluginFunction('addAfterRemoveHandlerListener', this.handleRemoveHandler);

    const handlersData = this.slider.callPluginFunction('getHandlersData');
    this.initHandlers(handlersData);

    const viewData = this.slider.callPluginFunction('getSliderData');
    this.updateVisuals(viewData);
    this.updateSliderData(this.slider.callPluginFunction('getSliderData'));
  }

  private addHandler({ handlerIndex, positionPart, item }: HandlerModelData): void {
    const newHandlerSection = initHandlerSection(
      this.elements.handlersSection, handlerIndex, positionPart, item.toString(),
    );

    newHandlerSection.addOnRemoveButtonClick(() => {
      this.slider.callPluginFunction('removeHandler', handlerIndex);
    });

    newHandlerSection.addOnPositionInputChange((event) => {
      this.handleHandlerInputPositionChange(handlerIndex, event);
    });

    newHandlerSection.addOnItemInputChange((event) => {
      this.handleHandlerInputItemChange(handlerIndex, event);
    });

    this.handlers.push(newHandlerSection);
    this.handlerCreationSection.addPairOption(handlerIndex);
  }

  private removeHandlerFromPanel(handlerIndex: number): void {
    const handlerToRemoveIndex = this.handlers.findIndex(
      (handler) => handler.getIndex() === handlerIndex,
    );
    this.handlers[handlerToRemoveIndex].remove();
    this.handlers.splice(handlerToRemoveIndex, 1);

    this.handlerCreationSection.removePairOption(handlerIndex);
  }

  private initHandlers(handlersData: { handlersArray: HandlerModelData[] }): void {
    handlersData.handlersArray.forEach((handler) => {
      this.addHandler(handler);
    });
  }

  private updateSliderData({ step, min, max }: SliderModelParams): void {
    this.properties.max.setValue(max);
    this.properties.min.setValue(min);
    this.properties.step.setValue(step);
  }

  private updateVisuals({ isVertical, withMarkup, isTooltipsVisible }: SliderViewParams): void {
    this.isVertical = isVertical;
    this.updateOrientation();

    this.withMarkup = withMarkup;
    this.updateMarkupVisibility();

    this.isTooltipsVisible = isTooltipsVisible;
    this.updateTooltipVisibility();
  }

  private initEventHandlers(): void {
    this.handlerCreationSection.addOnCreateHandlerButtonClick(
      this.handleCreateHandlerButtonClick,
    );
  }

  private initElements(panelElement: HTMLElement): void {
    const $wrap = $(panelElement);
    [this.elements.wrap] = $wrap;
    [this.elements.body] = $wrap.find(`.js-${SliderPanel.DEFAULT_CLASS}__body`);
    [this.elements.createHandlerSection] = $wrap.find(`.js-${SliderPanel.DEFAULT_CLASS}__create-handler`);
    [this.elements.handlersSection] = $wrap.find(`.js-${SliderPanel.DEFAULT_CLASS}__handlers`);
  }

  private initProperties(): void {
    this.properties.step = this.initProperty(
      `.js-${SliderPanel.DEFAULT_CLASS}__step`, this.handleStepInputChange,
    );

    this.properties.min = this.initProperty(
      `.js-${SliderPanel.DEFAULT_CLASS}__min`, this.handleMinInputChange,
    );

    this.properties.max = this.initProperty(`.js-${SliderPanel.DEFAULT_CLASS}__max`,
      this.handleMaxInputChange);

    this.properties.orientation = this.initProperty(
      `.js-${SliderPanel.DEFAULT_CLASS}__orientation`, this.handleOrientationInputChange,
    );

    this.properties.tooltipsVisibility = this.initProperty(
      `.js-${SliderPanel.DEFAULT_CLASS}__tooltips-visibility`, this.handleTooltipVisibilityInputChange,
    );

    this.properties.markupVisibility = this.initProperty(
      `.js-${SliderPanel.DEFAULT_CLASS}__markup-visibility`, this.handleMarkupInputChange,
    );
  }

  private handleCreateHandlerButtonClick = (): void => {
    const itemIndex = this.handlerCreationSection.getItemIndex();
    if (Number.isNaN(itemIndex)) return;

    const rangePair = this.handlerCreationSection.getSelectedPairOption();

    const createdHandlerData = this.slider.callPluginFunction('addHandler', itemIndex, rangePair);
    this.addHandler(createdHandlerData);
  }

  private handleMarkupInputChange = (event: Event): void => {
    const withMarkup = (event.target as HTMLInputElement).checked;
    this.withMarkup = withMarkup;

    this.slider.callPluginFunction('update', { withMarkup });
  }

  private handleOrientationInputChange = (event: Event): void => {
    const isVertical = (event.target as HTMLInputElement).checked;
    this.isVertical = isVertical;

    this.slider.callPluginFunction('update', { isVertical });
    this.updateOrientation();
  }

  private handleMinInputChange = (): void => {
    const minProp = this.properties.min;
    const min = Number.parseFloat(minProp.getValue() as string);

    this.slider.callPluginFunction('update', { min });
    minProp.setValue(this.slider.callPluginFunction('getSliderData').min);
  }

  private handleMaxInputChange = (): void => {
    const maxProp = this.properties.max;
    const max = Number.parseFloat(maxProp.getValue() as string);

    this.slider.callPluginFunction('update', { max });
    maxProp.setValue(this.slider.callPluginFunction('getSliderData').max);
  }

  private handleStepInputChange = (): void => {
    const stepProp = this.properties.step;
    const step = Number.parseFloat(stepProp.getValue() as string);

    this.slider.callPluginFunction('update', { step });
    stepProp.setValue(this.slider.callPluginFunction('getSliderData').step);
  }

  private handleTooltipVisibilityInputChange = (): void => {
    const isVisible = this.properties.tooltipsVisibility.getValue() as boolean;
    this.isTooltipsVisible = isVisible;
    this.slider.callPluginFunction('update', { isTooltipsVisible: isVisible });
  }

  private handleHandlerValueChange = (handlerData: HandlerModelData): void => {
    const changedHandler = this.handlers.find(
      (handler) => handler.getIndex() === handlerData?.handlerIndex,
    );
    if (!changedHandler) return;

    changedHandler.setItem(handlerData.item?.toString());
    changedHandler.setRelativePosition(handlerData.positionPart);
    changedHandler.updateElements();
  }

  private handleHandlerInputPositionChange = (handlerIndex: number, event: Event): void => {
    const newPosition = Number.parseFloat((event.target as HTMLInputElement).value);
    if (Number.isNaN(newPosition)) return;

    this.slider.callPluginFunction('moveHandler', handlerIndex, newPosition);
  }

  private handleHandlerInputItemChange = (handlerIndex: number, event: Event): void => {
    const newItem = (event.target as HTMLInputElement).value;
    this.slider.callPluginFunction('setHandlerItem', handlerIndex, newItem);
  }

  private handleRemoveHandler = (removedHandlerIndex: number): void => {
    this.removeHandlerFromPanel(removedHandlerIndex);
  }

  private initProperty(selector: string, handlerFunction: EventListener): PanelProperty {
    const property = initPanelProperty(this.elements.body.querySelector(selector) as HTMLElement);
    property.addOnChange(handlerFunction);

    return property;
  }

  private updateMarkupVisibility(): void {
    this.properties.markupVisibility.setValue(this.withMarkup);
  }

  private updateTooltipVisibility(): void {
    this.properties.tooltipsVisibility.setValue(this.isTooltipsVisible);
  }

  private updateOrientation(): void {
    const orientationModifier = `${SliderPanel.DEFAULT_CLASS}_${this.isVertical ? 'vertical' : 'horizontal'}`;
    const oldOrientationModifier = `${SliderPanel.DEFAULT_CLASS}_${this.isVertical ? 'horizontal' : 'vertical'}`;

    this.elements.wrap.classList.add(orientationModifier);
    this.elements.wrap.classList.remove(oldOrientationModifier);

    this.properties.orientation.setValue(this.isVertical);
  }
}

export default SliderPanel;
