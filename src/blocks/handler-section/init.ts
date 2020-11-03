import HandlerSection from './handler-section';
import { initBlocks } from '../../utils/functions';

function initHandlerSections(parentElement: JQuery | HTMLElement): HandlerSection[] {
  return initBlocks(
    parentElement, `.js-${HandlerSection.DEFAULT_CLASS}`, HandlerSection,
  ) as HandlerSection[];
}

export default initHandlerSections;
