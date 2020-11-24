import './slider-panel.scss';
import bind from 'bind-decorator';

import { PanelElements, PanelProperties } from './types';

import { SliderPluginParams } from '../../plugin/types';
import { HandlerModelData, SliderModelParams, SliderVisualParams } from '../../model/types';
import { KeyStringObj } from '../../utils/types';

import HandlerCreationSection from '../handler-creation-section/handler-creation-section';
import initHandlerCreationSection from '../handler-creation-section/init';
import HandlerSection from '../handler-section/handler-section';
import initHandlerSection from '../handler-section/init';
import PanelProperty from '../panel-property/panel-property';
import initPanelProperty from '../panel-property/init';
import initSliders from '../slider/init';
import Slider from '../slider/slider';

class SliderPanel {
  public static readonly DEFAULT_CLASS = 'slider-panel';

  private slider: Slider;

  private isVertical: boolean;

  private isTooltipsVisible: boolean;

  private isMarkupVisible: boolean;

  private handlers: HandlerSection[] = [];

  private elements: PanelElements;

  private panelProperties: PanelProperties & KeyStringObj;

  private readonly handlerCreationSection: HandlerCreationSection;

  constructor(private parentElement: HTMLElement) {
    this.initElements(parentElement);
    this.initProperties();
    [this.handlerCreationSection] = initHandlerCreationSection(this.elements.createHandlerSection);
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
    this.updateSliderData(viewData);
  }

  private addHandler(
    handlerModelData: HandlerModelData,
  ): void {
    if (!handlerModelData) {
      return;
    }
    const { handlerIndex, positionPart, item } = handlerModelData;

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
    this.panelProperties.max.setValue(max);
    this.panelProperties.min.setValue(min);
    this.panelProperties.step.setValue(step);
  }

  private updateVisuals(
    {
      isVertical = this.isVertical,
      isMarkupVisible = this.isMarkupVisible,
      isTooltipsVisible = this.isTooltipsVisible,
    }: SliderVisualParams,
  ): void {
    this.isVertical = isVertical;
    this.updateOrientation();

    this.isMarkupVisible = isMarkupVisible;
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
    this.elements = {
      wrap: $wrap[0],
      body: $wrap.find(`.js-${SliderPanel.DEFAULT_CLASS}__body`)[0],
      createHandlerSection: $wrap.find(`.js-${SliderPanel.DEFAULT_CLASS}__create-handler`)[0],
      handlersSection: $wrap.find(`.js-${SliderPanel.DEFAULT_CLASS}__handlers`)[0],
    };
  }

  private initProperties(): void {
    this.panelProperties = {
      min: this.initProperty(
        `.js-${SliderPanel.DEFAULT_CLASS}__min`, this.makePropInputChangeHandler('min'),
      ),
      max: this.initProperty(
        `.js-${SliderPanel.DEFAULT_CLASS}__max`, this.makePropInputChangeHandler('max'),
      ),
      step: this.initProperty(
        `.js-${SliderPanel.DEFAULT_CLASS}__step`, this.makePropInputChangeHandler('step'),
      ),
      orientation: this.initProperty(
        `.js-${SliderPanel.DEFAULT_CLASS}__orientation`,
        this.makePropInputChangeHandler('orientation', 'isVertical'),
      ),
      tooltipsVisibility: this.initProperty(
        `.js-${SliderPanel.DEFAULT_CLASS}__tooltips-visibility`,
        this.makePropInputChangeHandler('tooltipsVisibility', 'isTooltipsVisible'),
      ),
      markupVisibility: this.initProperty(
        `.js-${SliderPanel.DEFAULT_CLASS}__markup-visibility`,
        this.makePropInputChangeHandler('markupVisibility', 'isMarkupVisible'),
      ),
    };
  }

  @bind
  private handleCreateHandlerButtonClick(): void {
    const itemIndex = this.handlerCreationSection.getItemIndex();
    if (Number.isNaN(itemIndex)) return;

    const rangePair = this.handlerCreationSection.getSelectedPairOption();

    const createdHandlerData = this.slider.callPluginFunction('addHandler', itemIndex, rangePair);
    this.addHandler(createdHandlerData);
  }

  private makePropInputChangeHandler(propName: string, dataName?: string): EventListener {
    return (): void => {
      const prop = this.panelProperties[propName];
      const value = prop.getValue();
      const name = dataName ?? propName;

      if (typeof value === 'string' && Number.parseFloat(value)) {
        this.slider.callPluginFunction('update', { [name]: Number.parseFloat(value) });
        prop.setValue(this.slider.callPluginFunction('getSliderData')[name]);
      }
      if (typeof value === 'boolean') {
        this.slider.callPluginFunction('update', { [name]: value });
        this.updateVisuals({ [name]: value });
      }
    };
  }

  @bind
  private handleHandlerValueChange(handlerData: HandlerModelData): void {
    const changedHandler = this.handlers.find(
      (handler) => handler.getIndex() === handlerData?.handlerIndex,
    );
    if (!changedHandler) return;

    changedHandler.setItem(handlerData.item?.toString());
    changedHandler.setRelativePosition(handlerData.positionPart);
    changedHandler.updateElements();
  }

  @bind
  private handleHandlerInputPositionChange(handlerIndex: number, event: Event): void {
    let inputElement: HTMLInputElement;
    if (event.target instanceof HTMLInputElement) {
      inputElement = event.target;
    }
    const newPosition = Number.parseFloat(inputElement.value);
    if (Number.isNaN(newPosition)) return;

    this.slider.callPluginFunction('moveHandler', handlerIndex, newPosition);
  }

  @bind
  private handleHandlerInputItemChange(handlerIndex: number, event: Event): void {
    let inputElement: HTMLInputElement;
    if (event.target instanceof HTMLInputElement) {
      inputElement = event.target;
    }

    const newItem = inputElement.value;
    this.slider.callPluginFunction('setHandlerItem', handlerIndex, newItem);
  }

  @bind
  private handleRemoveHandler(removedHandlerIndex: number): void {
    this.removeHandlerFromPanel(removedHandlerIndex);
  }

  private initProperty(selector: string, handlerFunction: EventListener): PanelProperty {
    const property = initPanelProperty(this.elements.body.querySelector<HTMLElement>(selector));
    property.addOnChange(handlerFunction);

    return property;
  }

  private updateMarkupVisibility(): void {
    this.panelProperties.markupVisibility.setValue(this.isMarkupVisible);
  }

  private updateTooltipVisibility(): void {
    this.panelProperties.tooltipsVisibility.setValue(this.isTooltipsVisible);
  }

  private updateOrientation(): void {
    const orientationModifier = `${SliderPanel.DEFAULT_CLASS}_${this.isVertical ? 'vertical' : 'horizontal'}`;
    const oldOrientationModifier = `${SliderPanel.DEFAULT_CLASS}_${this.isVertical ? 'horizontal' : 'vertical'}`;

    this.elements.wrap.classList.add(orientationModifier);
    this.elements.wrap.classList.remove(oldOrientationModifier);

    this.panelProperties.orientation.setValue(this.isVertical);
  }
}

export default SliderPanel;
