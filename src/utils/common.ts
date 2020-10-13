import { KeyStringObj, Listenable } from './interfacesAndTypes';

const DEFAULT_SLIDER_PARAMS = { isVertical: false, showTooltips: true, withMarkup: false };

const DEFAULT_SLIDER_CLASS = 'liquidSlider';

const HANDLER_PAIR_OPTIONS = new Map()
  .set(null, null)
  .set('start', false)
  .set('end', true);

function parseClassesString(classesString: string): string[] {
  if (!classesString?.trim()) {
    return undefined;
  }

  return classesString.split(' ').filter((value) => value.length > 0);
}

function bindListeners(
  executor: string, listeners: Function[], executorContext: Listenable & KeyStringObj,
): void {
  const context = executorContext;
  const pureFunc = executorContext.listenDictionary[executor].func;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context[executor] = (...args: any): void => {
    const functionResult = pureFunc.call(executorContext, ...args);

    listeners.forEach((listener) => {
      listener(functionResult);
    });
  };
}

function addListenerAfter(
  executorName: string, listener: Function, executorContext: Listenable & KeyStringObj,
): void {
  if (!executorContext) return;

  const context = executorContext;
  if (!context.listenDictionary) {
    context.listenDictionary = {};
  }
  if (!executorContext.listenDictionary[executorName]) {
    context.listenDictionary[executorName] = {
      func: executorContext[executorName],
      listeners: [],
    };
  }

  const { listeners } = executorContext.listenDictionary[executorName];
  listeners.push(listener);

  bindListeners(executorName, listeners, executorContext);
}

function removeListener(
  executor: string, listener: Function, executorContext: Listenable,
): void {
  if (!executorContext?.listenDictionary?.[executor]) {
    return;
  }

  const { listeners } = executorContext.listenDictionary[executor];
  const listenerIndex = listeners.findIndex((value: Function) => listener === value);
  if (listenerIndex === -1) {
    return;
  }

  listeners.splice(listenerIndex, 1);
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

function roundToDecimal(numToRound: number, decimalsCount: number): number {
  let multiplier = 1;

  for (let i = 0; i < decimalsCount; i += 1) {
    multiplier *= 10;
  }

  return Math.round((numToRound + Number.EPSILON) * multiplier) / multiplier;
}

function standardize(
  value: number, parameters: { min: number; max: number; step: number },
): number {
  const min = Math.min(parameters.max, parameters.min);
  const max = Math.max(parameters.max, parameters.min);
  if (value > max) return max;
  if (value < min) return min;

  const remainder = (value - min) % parameters.step;
  if (remainder === 0) return value;

  let resultValue = value - remainder;
  if ((parameters.step / 2) < remainder) {
    resultValue += parameters.step;
  }

  resultValue = clamp(resultValue, min, max);
  return roundToDecimal(resultValue, 4);
}

function calculateElementCenter(DOMElement: Element): { x: number; y: number } {
  const thisRect = DOMElement.getBoundingClientRect();

  return {
    x: thisRect.left + thisRect.width / 2,
    y: thisRect.top + thisRect.height / 2,
  };
}

const preventDefault = (event: Event): void => event.preventDefault();

function createElement(
  elementName: string, classes: string, wrap?: HTMLElement,
): HTMLElement {
  const propElement = document.createElement(elementName);
  propElement.classList.add(classes);

  if (wrap) wrap.append(propElement);

  return propElement;
}

function createLabel(
  labelText: string, classes: string, wrap?: HTMLElement,
): HTMLElement {
  const label = createElement(
    'label', classes, wrap,
  );
  label.innerText = labelText;

  return label;
}

function createInput(
  classes: string, wrap?: HTMLElement, isCheckbox?: boolean,
): HTMLInputElement {
  const input = createElement('input',
    classes, wrap);

  if (isCheckbox) input.setAttribute('type', 'checkbox');

  return (input as HTMLInputElement);
}

function createButton(
  text: string, classes: string, wrap?: HTMLElement,
): HTMLButtonElement {
  const button = createElement('button', classes, wrap) as HTMLButtonElement;
  button.innerText = text;

  return button;
}

export {
  DEFAULT_SLIDER_CLASS, DEFAULT_SLIDER_PARAMS, HANDLER_PAIR_OPTIONS,
  parseClassesString, addListenerAfter, removeListener, standardize, calculateElementCenter, clamp,
  roundToDecimal, preventDefault,
  createElement, createLabel, createInput, createButton,
};
