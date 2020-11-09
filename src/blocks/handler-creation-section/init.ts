import HandlerCreationSection from './handler-creation-section';
import { initBlocks } from '../../utils/functions';

function initHandlerCreationSection(parentElement: JQuery | HTMLElement): HandlerCreationSection[] {
  return initBlocks(
    parentElement, `.js-${HandlerCreationSection.DEFAULT_CLASS}`, HandlerCreationSection,
  );
}

export default initHandlerCreationSection;
