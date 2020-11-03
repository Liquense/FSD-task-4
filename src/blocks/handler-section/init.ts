import HandlerSection from './handler-section';

function initHandlerSection(
  parentElement: HTMLElement, handlerIndex: number, positionPart: number, item: string,
): HandlerSection {
  return new HandlerSection(parentElement, handlerIndex, positionPart, item);
}

export default initHandlerSection;
