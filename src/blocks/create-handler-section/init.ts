import CreateHandlerSection from './create-handler-section';
import { initBlocks } from '../../utils/functions';

function initCreateHandlerSection(parentElement: JQuery | HTMLElement): CreateHandlerSection[] {
  return initBlocks(
    parentElement, `.js-${CreateHandlerSection.DEFAULT_CLASS}`, CreateHandlerSection,
  ) as CreateHandlerSection[];
}

export default initCreateHandlerSection;
