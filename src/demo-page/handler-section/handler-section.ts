import * as sectionTemplate from './handler-section-template.pug';
import PanelProperty from '../panel-property/panel-property';

class HandlerSection {
  private static DEFAULT_CLASS = 'handler-section';

  private wrap: HTMLElement;

  private body: HTMLElement;

  private removeButton: HTMLButtonElement;

  private positionSection: PanelProperty;

  private $itemElement: JQuery;

  private readonly handlerIndex: number;

  constructor(
    parentElement: HTMLElement, handlerIndex: number,
    private itemIndex: number = null, private item = '',
  ) {
    this.handlerIndex = handlerIndex;
    this.initElements(parentElement, handlerIndex);
  }

  public getIndex(): number {
    return this.handlerIndex;
  }

  public getItem(): string {
    return this.item;
  }

  public addOnRemoveButtonClick(eventHandler: EventListener): void {
    $(this.removeButton).on('click.handlerSection', eventHandler);
  }

  public addOnPositionInputChange(listener: EventListener): void {
    this.positionSection.addOnChange(listener);
  }

  public addOnItemInputChange(listener: EventListener): void {
    this.$itemElement.on('change.handler-section', listener);
  }

  public remove(): void {
    this.body.remove();
  }

  public setRelativePosition(itemIndex: number): void {
    this.itemIndex = itemIndex ?? this.itemIndex;
  }

  public setItem(value: string): void {
    this.item = value ?? this.item;
  }

  public updateElements(): void {
    this.$itemElement.val(this.item);
    this.positionSection.setValue(this.itemIndex.toFixed(2));
  }

  private initElements(parentElement: HTMLElement, handlerIndex: number): void {
    this.wrap = parentElement;

    this.body = document.createElement('div');
    this.body.innerHTML = sectionTemplate({ index: handlerIndex + 1 });
    this.wrap.append(this.body);

    this.$itemElement = $(this.body).find(`.js-${HandlerSection.DEFAULT_CLASS}__item`);

    this.positionSection = new PanelProperty(this.body);

    this.removeButton = this.body.querySelector(`.js-${HandlerSection.DEFAULT_CLASS}__remove-button`);

    this.updateElements();
  }
}

export default HandlerSection;
