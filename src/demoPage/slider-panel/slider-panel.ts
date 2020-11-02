import Controller from '../../controller/Controller';

import './slider-panel.scss';

import { SliderPluginParams } from '../../types';
import CreateHandlerSection from '../create-handler-section/create-handler-section';
import { SliderViewParams } from '../../view/types';
import { HandlerModelData, SliderModelParams } from '../../model/types';
import HandlerSection from '../handler-section/handler-section';
import PanelProperty from '../panel-property/panel-property';

class SliderPanel {
  private slider: Controller;

  private isVertical: boolean;

  private isTooltipsVisible: boolean;

  private withMarkup: boolean;

  private handlers: HandlerSection[] = [];

  static readonly classPrefix = 'slider-panel';

  private readonly elements = {
    wrap: null as HTMLElement,
    body: null as HTMLElement,
    handlersSection: null as HTMLElement,
    createHandlerSection: null as HTMLElement,
  };

  private readonly properties = {
    max: null as PanelProperty,
    min: null as PanelProperty,
    step: null as PanelProperty,
    orientation: null as PanelProperty,
    tooltipsVisibility: null as PanelProperty,
    markupVisibility: null as PanelProperty,
  }

  private readonly handlerCreationSection = null as CreateHandlerSection;

  constructor(private parentElement: HTMLElement) {
    this.initElements(parentElement);
    this.initProperties();
    this.handlerCreationSection = new CreateHandlerSection(this.elements.createHandlerSection);
    this.initEventHandlers();
  }

  public initSlider(element: HTMLElement | JQuery, sliderParams?: SliderPluginParams): void {
    this.slider = $(element).liquidSlider(sliderParams);
    this.slider.addAfterHandlerValueChangedListener(this.handleHandlerValueChange);
    this.slider.addAfterRemoveHandlerListener(this.handleRemoveHandler);

    const handlersData = this.slider.getHandlersData();
    this.initHandlers(handlersData);

    const viewData = this.slider.getSliderData();
    this.updateVisuals(viewData);
    this.updateSliderData(this.slider.getSliderData());
  }

  private addHandler({ handlerIndex, positionPart, item }: HandlerModelParams): void {
    const newHandlerSection = new HandlerSection(
      this.elements.handlersSection, handlerIndex,
      positionPart, item.toString(),
    );

    newHandlerSection.addOnRemoveButtonClick(
      () => { this.slider.removeHandler(handlerIndex); },
    );

    newHandlerSection.addOnPositionInputChange((event) => {
      const newPosition = Number.parseFloat((event.target as HTMLInputElement).value);
      if (Number.isNaN(newPosition)) return;
      this.slider.moveHandler(handlerIndex, newPosition);
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

  private initHandlers(handlersData: { handlersArray: HandlerModelParams[] }): void {
    handlersData.handlersArray.forEach((handler) => { this.addHandler(handler); });
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
    [this.elements.body] = $wrap.find(`.js-${SliderPanel.classPrefix}__body`);
    [this.elements.createHandlerSection] = $wrap.find(`.js-${SliderPanel.classPrefix}__create-handler`);
    [this.elements.handlersSection] = $wrap.find(`.js-${SliderPanel.classPrefix}__handlers`);
  }

  private initProperties(): void {
    this.properties.step = this.initProperty(
      `.js-${SliderPanel.classPrefix}__step`, this.handleStepInputChange,
    );

    this.properties.min = this.initProperty(
      `.js-${SliderPanel.classPrefix}__min`, this.handleMinInputChange,
    );

    this.properties.max = this.initProperty(`.js-${SliderPanel.classPrefix}__max`,
      this.handleMaxInputChange);

    this.properties.orientation = this.initProperty(
      `.js-${SliderPanel.classPrefix}__orientation`, this.handleOrientationInputChange,
    );

    this.properties.tooltipsVisibility = this.initProperty(
      `.js-${SliderPanel.classPrefix}__tooltips-visibility`, this.handleTooltipVisibilityInputChange,
    );

    this.properties.markupVisibility = this.initProperty(
      `.js-${SliderPanel.classPrefix}__markup-visibility`, this.handleMarkupInputChange,
    );
  }

  private handleCreateHandlerButtonClick = (): void => {
    const itemIndex = this.handlerCreationSection.getItemIndex();
    if (Number.isNaN(itemIndex)) return;

    const rangePair = this.handlerCreationSection.getSelectedPairOption();

    const createdHandlerData = this.slider.addHandler(itemIndex, rangePair);
    this.addHandler(createdHandlerData);
  }

  private handleMarkupInputChange = (event: Event): void => {
    const withMarkup = (event.target as HTMLInputElement).checked;
    this.withMarkup = withMarkup;

    this.slider.update({ withMarkup });
  }

  private handleOrientationInputChange = (event: Event): void => {
    const isVertical = (event.target as HTMLInputElement).checked;
    this.isVertical = isVertical;

    this.slider.update({ isVertical });
    this.updateOrientation();
  }

  private handleMinInputChange = (): void => {
    const minProp = this.properties.min;
    const min = Number.parseFloat(minProp.getValue() as string);

    this.slider.update({ min });
    minProp.setValue(this.slider.getSliderData().min);
  }

  private handleMaxInputChange = (): void => {
    const maxProp = this.properties.max;
    const max = Number.parseFloat(maxProp.getValue() as string);

    this.slider.update({ max });
    maxProp.setValue(this.slider.getSliderData().max);
  }

  private handleStepInputChange = (): void => {
    const stepProp = this.properties.step;
    const step = Number.parseFloat(stepProp.getValue() as string);

    this.slider.update({ step });
    stepProp.setValue(this.slider.getSliderData().step);
  }

  private handleTooltipVisibilityInputChange = (): void => {
    const isVisible = this.properties.tooltipsVisibility.getValue() as boolean;
    this.isTooltipsVisible = isVisible;
    this.slider.update({ isTooltipsVisible: isVisible });
  }

  private handleHandlerValueChange = (handlerData: HandlerModelParams): void => {
    const changedHandler = this.handlers.find(
      (handler) => handler.getIndex() === handlerData?.handlerIndex,
    );
    if (!changedHandler) return;

    changedHandler.setItem(handlerData.item?.toString());
    changedHandler.setRelativePosition(handlerData.positionPart);
    changedHandler.updateElements();
  }

  private handleRemoveHandler = (removedHandlerIndex: number): void => {
    this.removeHandlerFromPanel(removedHandlerIndex);
  }

  private initProperty(selector: string, handlerFunction: EventListener): PanelProperty {
    const property = new PanelProperty(this.elements.body.querySelector(selector));
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
    const orientationModifier = `${SliderPanel.classPrefix}_${this.isVertical ? 'vertical' : 'horizontal'}`;
    const oldOrientationModifier = `${SliderPanel.classPrefix}_${this.isVertical ? 'horizontal' : 'vertical'}`;

    this.elements.wrap.classList.add(orientationModifier);
    this.elements.wrap.classList.remove(oldOrientationModifier);

    this.properties.orientation.setValue(this.isVertical);
  }
}

export default SliderPanel;
