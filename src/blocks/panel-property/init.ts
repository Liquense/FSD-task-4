import PanelProperty from './panel-property';
import { initBlocks } from '../../utils/functions';

function initPanelProperty(parentElement: JQuery | HTMLElement): PanelProperty {
  return initBlocks(parentElement, `.js-${PanelProperty.DEFAULT_CLASS}`, PanelProperty)[0];
}

export default initPanelProperty;
