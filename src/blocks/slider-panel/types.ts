import PanelProperty from '../panel-property/panel-property';

type PanelElements = {
  wrap: HTMLElement;
  body: HTMLElement;
  handlersSection: HTMLElement;
  createHandlerSection: HTMLElement;
}

type PanelProperties = {
  max: PanelProperty;
  min: PanelProperty;
  step: PanelProperty;
  orientation: PanelProperty;
  tooltipsVisibility: PanelProperty;
  markupVisibility: PanelProperty;
}

export { PanelElements, PanelProperties };
