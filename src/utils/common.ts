// некоторые функции созданы для того, чтобы менять свойства в параметре
// (bindListeners, addListenerAfter)
import { KeyStringObj } from './types';
import { Listenable } from './interfaces';

export const DEFAULT_SLIDER_PARAMS = { isVertical: false, showTooltips: true, withMarkup: false };

export const DEFAULT_SLIDER_CLASS = 'liquidSlider';

export function parseClassesString(classesString: string): string[] {
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

  // параметры функций действительно могут быть любыми
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context[executor] = (...args: any): void => {
    const functionResult = pureFunc.call(executorContext, ...args);

    // добавляется выполнение всех слушателей после исполнения функции
    listeners.forEach((listener) => {
      listener(functionResult);
    });
  };
}

export function addListenerAfter(
  executorName: string, listener: Function, executorContext: Listenable & KeyStringObj,
): void {
  if (!executorContext) {
    return;
  }

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

export function removeListener(
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

export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

export function roundToDecimal(numToRound: number, decimalsCount: number): number {
  let multiplier = 1;

  for (let i = 0; i < decimalsCount; i += 1) {
    multiplier *= 10;
  }

  return Math.round((numToRound + Number.EPSILON) * multiplier) / multiplier;
}

export function standardize(
  value: number, parameters: { min: number; max: number; step: number },
): number {
  const min = Math.min(parameters.max, parameters.min);
  const max = Math.max(parameters.max, parameters.min); // на всякий случай

  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }

  let resultValue: number;
  const remainder = (value - min) % parameters.step;

  if (remainder === 0) {
    return value;
  }
  if (parameters.step / 2 > remainder) {
    resultValue = value - remainder; // ближе к нижней части шага
  } else {
    resultValue = value + (parameters.step - remainder); // ближе к верхней части
  }

  resultValue = clamp(resultValue, min, max);
  return roundToDecimal(resultValue, 4);
}

export function calculateElementCenter(DOMElement: Element, isVertical: boolean): number {
  const thisRect = DOMElement.getBoundingClientRect();
  let thisCenter: number;

  if (isVertical) {
    thisCenter = thisRect.top + thisRect.height / 2;
  } else {
    thisCenter = thisRect.left + thisRect.width / 2;
  }

  return thisCenter;
}

export const HANDLER_PAIR_OPTIONS = new Map()
  .set(null, null)
  .set('start', false)
  .set('end', true);
