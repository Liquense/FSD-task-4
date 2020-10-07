/* eslint-disable @typescript-eslint/ban-ts-ignore,no-undef,dot-notation */
import SliderView from '../sliderView';
import HandlerView from '../handler/handlerView';

import RangeView from './rangeView';

jest.mock('../handler/handlerView');
jest.mock('../sliderView');
let testRange: RangeView;

const testSlider = new SliderView(null, {});
testSlider.getScaleStart = jest.fn(() => 0);
testSlider.getScaleEnd = jest.fn(() => 100);
testSlider.getScaleBorderWidth = jest.fn(() => 2);

const horizontalClass = 'horizontal';
const verticalClass = 'vertical';
testSlider.getOrientationClass = jest.fn(function () {
  return this.isVertical ? verticalClass : horizontalClass;
});

const firstHandler = new HandlerView(testSlider, null);
const secondHandler = new HandlerView(testSlider, null);

describe('Инициализация', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    testRange = new RangeView(testSlider, document.body, firstHandler, secondHandler);
  });

  test('Установка значений полей', () => {
    expect(testRange.parentElement).toBe(document.body);
    expect(testRange['parentSlider']).toBe(testSlider);
  });

  describe('Правильное назначение хэндлеров', () => {
    test('Один хэндлер', () => {
      firstHandler.getRangePair = jest.fn(() => 'start');
      testRange = new RangeView(testSlider, document.body, firstHandler);
      expect(testRange.getEndHandler()).toBe(firstHandler);

      firstHandler.getRangePair = jest.fn(() => 'end');
      testRange = new RangeView(testSlider, document.body, firstHandler);
      expect(testRange.getStartHandler()).toBe(firstHandler);
    });
    test('Два хэндлера', () => {
      const testTwoHandlers = (firstPos: number, secondPos: number): void => {
        firstHandler.getPositionPart = jest.fn(() => firstPos);
        secondHandler.getPositionPart = jest.fn(() => secondPos);
        testRange = new RangeView(testSlider, document.body, firstHandler, secondHandler);
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
    test('Создание горизонтально', () => {
      const expectedBody = document.body.querySelector(`.liquidSlider__range.${horizontalClass}`);
      expect(testRange['element']).toBe(expectedBody);
    });
    test('Создание вертикально', () => {
      document.body.innerHTML = '';
      testSlider.getOrientationClass = jest.fn(() => 'vertical');
      testRange = new RangeView(testSlider, document.body, firstHandler, secondHandler);

      const expectedBody = document.body.querySelector(`.liquidSlider__range.${verticalClass}`);
      expect(testRange['element']).toBe(expectedBody);
    });

    describe('Добавление стилей', () => {
      beforeAll(() => {
        firstHandler.getPositionCoordinate = jest.fn(() => 20);
        secondHandler.getPositionCoordinate = jest.fn(() => 80);
      });

      test('Один хэндлер', async () => {
        function initTest(handlerSide: string, offsetDirection: string, expandDimension: string) {
          return new Promise((resolve) => {
            firstHandler.getRangePair = jest.fn(() => handlerSide);
            testSlider.getOffsetDirection = jest.fn(() => offsetDirection);
            testSlider.getExpandDimension = jest.fn(() => expandDimension);

            testRange = new RangeView(testSlider, document.body, firstHandler);

            requestAnimationFrame(() => {
              resolve();
            });
          });
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

        function initTest(offsetDirection: string, expandDimension: string): Promise<boolean> {
          return new Promise((resolve) => {
            testSlider.getOffsetDirection = jest.fn(() => offsetDirection);
            testSlider.getExpandDimension = jest.fn(() => expandDimension);

            testRange = new RangeView(testSlider, document.body, firstHandler, secondHandler);

            requestAnimationFrame(() => {
              resolve(true);
            });
          });
        }

        await initTest('left', 'width');
        expect(testRange['element'].style.left).toBe('20px');
        expect(testRange['element'].style.width).toBe('60px');

        await initTest('top', 'height');
        expect(testRange['element'].style.top).toBe('20px');
        expect(testRange['element'].style.height).toBe('60px');
      });
    });
  });

  test('Подписка на изменения хэндлеров', () => {
    const mockUpdatePosition = jest.fn();
    const origUpdatePosition = RangeView.prototype.refreshPosition;

    RangeView.prototype.refreshPosition = mockUpdatePosition;
    testRange = new RangeView(testSlider, document.body, firstHandler, secondHandler);
    RangeView.prototype.refreshPosition = origUpdatePosition;

    expect(mockUpdatePosition.mock.calls.length).toBe(0);

    testSlider.getIsVertical = jest.fn(() => true);
    firstHandler.refreshPosition();
    expect(mockUpdatePosition.mock.calls.length).toBe(1);

    testSlider.getIsVertical = jest.fn(() => false);
    secondHandler.refreshPosition();
    expect(mockUpdatePosition.mock.calls.length).toBe(2);
  });
});
test('Функция проверки наличия хэндлера', () => {
  // эти хэндлеры добавлены при создании
  expect(testRange.hasHandler(firstHandler)).toBeTruthy();
  expect(testRange.hasHandler(secondHandler)).toBeTruthy();
  // вообще левый хэндлер
  expect(testRange.hasHandler(new HandlerView(null, null))).toBeFalsy();
});
