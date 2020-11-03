class CreateHandlerSection {
  public static readonly DEFAULT_CLASS = 'create-handler-section';

  private readonly pairOptions = new Map()
    .set('Никем', null).set('Началом', 'start').set('Концом', 'end');

  private body: HTMLElement;

  private itemInput: HTMLInputElement;

  private pairSelect: HTMLSelectElement;

  private createButton: HTMLButtonElement;

  constructor(parentElement: HTMLElement | JQuery) {
    this.initElements(parentElement);
    this.fillPairOptions();
  }

  public getBody(): HTMLElement {
    return this.body;
  }

  public getItemIndex(): number {
    return Number.parseFloat(this.itemInput.value);
  }

  public getItemInput(): HTMLInputElement {
    return this.itemInput;
  }

  public getPairSelect(): HTMLSelectElement {
    return this.pairSelect;
  }

  public getCreateButton(): HTMLButtonElement {
    return this.createButton;
  }

  public getSelectedPairOption(): string {
    const selectedOptionValue = this.pairSelect.selectedOptions[0].value;
    const isInteger = Number.isInteger(Number.parseInt(selectedOptionValue, 10));
    const valueToSearch = isInteger
      ? (Number.parseInt(selectedOptionValue, 10) + 1) : selectedOptionValue;

    return this.pairOptions.get(valueToSearch.toString());
  }

  public addOnCreateHandlerButtonClick(listener: EventListener): void {
    $(this.createButton).on('click.createHandler', listener);
  }

  public removePairOption(index: number): void {
    Object.entries(this.pairSelect).some((option, i) => {
      if (option[1].innerText === (index + 1).toString()) {
        this.pairSelect.remove(i);
        return true;
      }
      return false;
    });
  }

  public addPairOption(optionKey: number | string, optionValue?: number | string): void {
    let caption: string;
    if (typeof optionKey === 'number') {
      caption = (optionKey + 1).toString();
    } else {
      caption = optionKey;
    }

    this.pairOptions.set(caption, optionValue === undefined ? optionKey : optionValue);

    const optionElement = document.createElement('option');
    optionElement.value = optionKey.toString();
    optionElement.innerText = caption;

    this.pairSelect.add(optionElement);
  }

  private initElements(parentElement: HTMLElement | JQuery): void {
    const defaultClass = CreateHandlerSection.DEFAULT_CLASS;
    const $parentElement = $(parentElement);
    const isBody = $parentElement.hasClass(defaultClass);
    const $body = isBody ? $parentElement : $parentElement.find(`.js-${defaultClass}`);

    [this.body] = $body.get();
    this.itemInput = $body.find(`.js-${defaultClass}__value .js-panel-property__input`).get()[0] as HTMLInputElement;
    this.pairSelect = $body.find(`.js-${defaultClass}__pair .js-panel-property__input`).get()[0] as HTMLSelectElement;
    this.createButton = $body.find(`.js-${defaultClass}__create-button`).get()[0] as HTMLButtonElement;
  }

  private fillPairOptions(): void {
    this.pairOptions.forEach((optionValue, optionKey) => {
      this.addPairOption(optionKey, optionValue);
    });
  }
}

export default CreateHandlerSection;
