import { Newable } from './types';
import { SliderModelParams } from '../model/types';

function parseClassesString(classesString: string): string[] {
  if (!classesString?.trim()) {
    return undefined;
  }

  return classesString.split(' ').filter((value) => value.length > 0);
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

function roundToDecimal(numToRound: number, decimalsCount = 5): number {
  let multiplier = 1;
  new Array(decimalsCount).fill(null).forEach(() => {
    multiplier *= 10;
  });

  return Math.round((numToRound + Number.EPSILON) * multiplier) / multiplier;
}

function standardize(
  value: number, { min, max, step }: SliderModelParams,
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
  return roundToDecimal(resultValue);
}

function calculateElementCenter(DOMElement: Element): { x: number; y: number } {
  const thisRect = DOMElement.getBoundingClientRect();

  return {
    x: thisRect.left + thisRect.width / 2,
    y: thisRect.top + thisRect.height / 2,
  };
}

function preventDefault(event: Event): void {
  event.preventDefault();
}

function initBlocks<T extends object>(
  rootElement: JQuery | HTMLElement,
  selector: string,
  ClassToInit: Newable<T>,
  ...classInitParams: any[]
): T[] {
  const blockInstanceKey = `${ClassToInit.name}Instance`;
  const blocks: T[] = [];
  const $blocks = rootElement ? $(rootElement).find(selector) : $(selector);

  $blocks.each((index, element) => {
    const $block = $(element);

    if ($block.data(blockInstanceKey)) {
      blocks.push($block.data(blockInstanceKey));
      return;
    }

    const blockInstance = new ClassToInit(element, ...classInitParams);
    $block.data(blockInstanceKey, blockInstance);
    blocks.push(blockInstance);
  });

  return blocks;
}

function hasOwnProperty<T>(object: T, key: PropertyKey): key is keyof T {
  return key in object;
}

export {
  parseClassesString, standardize, calculateElementCenter, clamp,
  roundToDecimal, preventDefault, initBlocks, hasOwnProperty,
};
