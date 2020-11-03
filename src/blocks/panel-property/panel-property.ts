class PanelProperty {
  public static DEFAULT_CLASS = 'panel-property';

  private body: HTMLElement;

  private caption: HTMLElement;

  private input: HTMLInputElement;

  private isCheckbox: boolean;

  constructor(parentElement: HTMLElement) {
    this.initElements(parentElement);
    this.initProperties();
  }

  public addOnChange(listener: EventListener): void {
    $(this.input).on('change.panelProperty', listener);
  }

  public setValue(value: number | string | boolean): void {
    switch (typeof value) {
      case 'string':
        this.input.value = value;
        break;
      case 'boolean':
        this.input.checked = value;
        break;
      case 'number':
        this.input.value = value.toFixed(2);
        break;
      default:
        break;
    }
  }

  public getValue(): boolean | string {
    return this.isCheckbox ? this.input.checked : this.input.value;
  }

  private initElements(parentElement: HTMLElement): void {
    this.body = parentElement;
    this.caption = this.body.querySelector(`.js-${PanelProperty.DEFAULT_CLASS}__caption`);
    this.input = this.body.querySelector(`.js-${PanelProperty.DEFAULT_CLASS}__input`);
  }

  private initProperties(): void {
    this.isCheckbox = (this.input.type === 'checkbox');
  }
}

export default PanelProperty;
