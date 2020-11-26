/* eslint-disable @typescript-eslint/ban-ts-ignore,no-undef,dot-notation */
import { HandlerPair } from '../types';

import HandlerView from '../handler/HandlerView';

import RangeView from './RangeView';

jest.mock('../handler/HandlerView');
let testRange: RangeView;
const sliderViewParams = {
  isVertical: false,
  expandDimension: 'width' as const,
  offsetDirection: 'left' as const,
  relativeHandlerSize: 0.05,
  stepPart: 0.01,
  scaleStart: 0,
  scaleEnd: 100,
  scaleBorderWidth: 2,
  workZoneLength: 90,
};
let firstHandler: HandlerView;
let secondHandler: HandlerView;

describe('Инициализация', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    firstHandler = new HandlerView(null, null, null);
    secondHandler = new HandlerView(null, null, null);
    testRange = new RangeView(document.body, sliderViewParams, firstHandler, secondHandler);
  });

  test('Установка значений полей', () => {
    expect(testRange.parentElement).toBe(document.body);
  });

  describe('Правильное назначение хэндлеров', () => {
    test('Один хэндлер', () => {
      firstHandler.getPair = jest.fn(() => 'start');
      testRange = new RangeView(document.body, sliderViewParams, firstHandler);
      expect(testRange.getEndHandler()).toBe(firstHandler);

      firstHandler.getPair = jest.fn(() => 'end');
      testRange = new RangeView(document.body, sliderViewParams, firstHandler);
      expect(testRange.getStartHandler()).toBe(firstHandler);
    });
    test('Два хэндлера', () => {
      const testTwoHandlers = (firstPos: number, secondPos: number): void => {
        firstHandler.getPositionPart = jest.fn(() => firstPos);
        secondHandler.getPositionPart = jest.fn(() => secondPos);
        testRange = new RangeView(document.body, sliderViewParams, firstHandler, secondHandler);
      };

      testTwoHandlers(0, 0);
      expect(testRange.getStartHandler()).toBe(firstHandler);
      expect(testRange.getEndHandler()).toBe(secondHandler);

      testTwoHandlers(0, 1);
      expect(testRange.getStartHandler()).toBe(firstHandler);
      expect(testRange.getEndHandler()).toBe(secondHandler);

      testTwoHandlers(1, 0);
      expect(testRange.getStartHandler()).toBe(secondHandler);
      expect(testRange.getEndHandler()).toBe(firstHandler);
    });
  });

  describe('Создание HTML-тела', () => {
    test('Создание', () => {
      const expectedBody = document.body.querySelector('.liquid-slider__range');
      expect(testRange['element']).toBe(expectedBody);
    });

    describe('Добавление стилей', () => {
      beforeEach(() => {
        firstHandler.getPositionCoordinate = jest.fn(() => 20);
        secondHandler.getPositionCoordinate = jest.fn(() => 80);
      });

      test('Один хэндлер', async () => {
        function initTest(
          handlerSide: HandlerPair, offsetDirection: 'top' | 'left', expandDimension: 'height' | 'width',
        ): void {
          firstHandler.getPair = jest.fn(() => handlerSide);

          testRange = new RangeView(
            document.body,
            { ...sliderViewParams, ...{ offsetDirection, expandDimension } },
            firstHandler,
          );
        }

        await initTest('end', 'left', 'width');
        expect(testRange['element'].style.left).toBe('20px');
        expect(testRange['element'].style.width).toBe('78px');

        await initTest('end', 'top', 'height');
        expect(testRange['element'].style.top).toBe('20px');
        expect(testRange['element'].style.height).toBe('78px');

        await initTest('start', 'left', 'width');
        expect(testRange['element'].style.left).toBe('2px');
        expect(testRange['element'].style.width).toBe('18px');

        await initTest('start', 'top', 'height');
        expect(testRange['element'].style.top).toBe('2px');
        expect(testRange['element'].style.height).toBe('18px');
      });

      test('Два хэндлера', async () => {
        firstHandler.getPositionPart = jest.fn(() => 0);
        secondHandler.getPositionPart = jest.fn(() => 1);

        function initTestRange(offsetDirection: 'top' | 'left', expandDimension: 'height' | 'width'): void {
          testRange = new RangeView(
            document.body,
            { ...sliderViewParams, ...{ offsetDirection, expandDimension } },
            firstHandler,
            secondHandler,
          );
        }

        await initTestRange('left', 'width');
        expect(testRange['element'].style.left).toBe('20px');
        expect(testRange['element'].style.width).toBe('60px');

        await initTestRange('top', 'height');
        expect(testRange['element'].style.top).toBe('20px');
        expect(testRange['element'].style.height).toBe('60px');
      });
    });
  });
});

test('Функция проверки наличия хэндлера', () => {
  expect(testRange.hasHandler(firstHandler)).toBeTruthy();
  expect(testRange.hasHandler(secondHandler)).toBeTruthy();

  expect(testRange.hasHandler(new HandlerView(null, null, null))).toBeFalsy();
});
