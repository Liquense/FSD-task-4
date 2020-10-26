import { Listenable } from '../interfaces';
import { KeyStringObj } from '../types';
import { PositioningParams } from '../model/types';

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
  const pureFunc = context.listenDictionary[executor].func;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context[executor] = (...args: any): void => {
    const functionResult = pureFunc.call(context, ...args);

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
  value: number, { min, max, step }: PositioningParams,
): number {
  const realMin = Math.min(max, min);
  const realMax = Math.max(max, min);
  if (value > realMax) return realMax;
  if (value < realMin) return realMin;

  const remainder = (value - realMin) % step;
  if (remainder === 0) return value;

  let resultValue = value - remainder;
  if ((step / 2) < remainder) {
    resultValue += step;
  }

  resultValue = clamp(resultValue, realMin, realMax);
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
  const input = createElement('input', classes, wrap);

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
  parseClassesString, addListenerAfter, removeListener, standardize, calculateElementCenter, clamp,
  roundToDecimal, preventDefault,
  createElement, createLabel, createInput, createButton,
};
