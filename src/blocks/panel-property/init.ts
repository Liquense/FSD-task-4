import PanelProperty from './panel-property';
import { initBlocks } from '../../utils/functions';

function initPanelProperty(parentElement: JQuery | HTMLElement): PanelProperty | PanelProperty[] {
  return initBlocks(
    parentElement, `.js-${PanelProperty.DEFAULT_CLASS}`, PanelProperty,
  ) as PanelProperty[];
}

export default initPanelProperty;
