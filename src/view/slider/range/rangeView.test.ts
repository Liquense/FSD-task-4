/* eslint-disable @typescript-eslint/ban-ts-ignore,no-undef,dot-notation */
import RangeView from './rangeView';
import SliderView from '../sliderView';
import HandlerView from '../handler/handlerView';

jest.mock('../handler/handlerView');
jest.mock('../sliderView');
let testRange: RangeView;

const testSlider = new SliderView(null, {});
// @ts-ignore
testSlider.scaleStart = 0;
// @ts-ignore
testSlider.scaleEnd = 100;
// @ts-ignore
testSlider.scaleBorderWidth = 2;

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
      firstHandler.rangePair = 'start';
      testRange = new RangeView(testSlider, document.body, firstHandler);
      expect(testRange.endHandler).toBe(firstHandler);

      firstHandler.rangePair = 'end';
      testRange = new RangeView(testSlider, document.body, firstHandler);
      expect(testRange.startHandler).toBe(firstHandler);
    });
    test('Два хэндлера', () => {
      const testTwoHandlers = function (firstPos: number, secondPos: number) {
        // @ts-ignore
        firstHandler.positionPart = firstPos;
        // @ts-ignore
        secondHandler.positionPart = secondPos;
        testRange = new RangeView(testSlider, document.body, firstHandler, secondHandler);
      };

      testTwoHandlers(0, 0);
      expect(testRange.startHandler).toBe(firstHandler);
      expect(testRange.endHandler).toBe(secondHandler);

      testTwoHandlers(0, 1);
      expect(testRange.startHandler).toBe(firstHandler);
      expect(testRange.endHandler).toBe(secondHandler);

      testTwoHandlers(1, 0);
      expect(testRange.startHandler).toBe(secondHandler);
      expect(testRange.endHandler).toBe(firstHandler);
    });
  });

  describe('Создание HTML-тела', () => {
    test('Создание горизонтально', () => {
      const expectedBody = document.body.querySelector(`.liquidSlider__range.${horizontalClass}`);
      expect(testRange['_element']).toBe(expectedBody);
    });
    test('Создание вертикально', () => {
      document.body.innerHTML = '';
      testSlider.isVertical = true;
      testRange = new RangeView(testSlider, document.body, firstHandler, secondHandler);

      const expectedBody = document.body.querySelector(`.liquidSlider__range.${verticalClass}`);
      expect(testRange['_element']).toBe(expectedBody);
    });

    describe('Добавление стилей', () => {
      beforeAll(() => {
        // @ts-ignore
        firstHandler.positionCoordinate = 20;
        // @ts-ignore
        secondHandler.positionCoordinate = 80;
      });

      test('Один хэндлер', async () => {
        function initTest(handlerSide: string, offsetDirection: string, expandDimension: string) {
          return new Promise((resolve) => {
            firstHandler.rangePair = handlerSide;
            // @ts-ignore
            testSlider.offsetDirection = offsetDirection;
            // @ts-ignore
            testSlider.expandDimension = expandDimension;

            testRange = new RangeView(testSlider, document.body, firstHandler);

            requestAnimationFrame(() => {
              resolve();
            });
          });
        }

        await initTest('end', 'left', 'width');
        expect(testRange['_element'].style.left).toBe('20px');
        expect(testRange['_element'].style.width).toBe('78px');

        await initTest('end', 'top', 'height');
        expect(testRange['_element'].style.top).toBe('20px');
        expect(testRange['_element'].style.height).toBe('78px');

        await initTest('start', 'left', 'width');
        expect(testRange['_element'].style.left).toBe('2px');
        expect(testRange['_element'].style.width).toBe('18px');

        await initTest('start', 'top', 'height');
        expect(testRange['_element'].style.top).toBe('2px');
        expect(testRange['_element'].style.height).toBe('18px');
      });

      test('Два хэндлера', async () => {
        // @ts-ignore
        firstHandler.positionPart = 0;
        // @ts-ignore
        secondHandler.positionPart = 1;

        function initTest(offsetDirection: string, expandDimension: string): Promise<boolean> {
          return new Promise((resolve) => {
            // @ts-ignore
            testSlider.offsetDirection = offsetDirection;
            // @ts-ignore
            testSlider.expandDimension = expandDimension;

            testRange = new RangeView(testSlider, document.body, firstHandler, secondHandler);

            requestAnimationFrame(() => {
              resolve(true);
            });
          });
        }

        await initTest('left', 'width');
        expect(testRange['_element'].style.left).toBe('20px');
        expect(testRange['_element'].style.width).toBe('60px');

        await initTest('top', 'height');
        expect(testRange['_element'].style.top).toBe('20px');
        expect(testRange['_element'].style.height).toBe('60px');
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

    testSlider.isVertical = true;
    firstHandler.refreshPosition();
    expect(mockUpdatePosition.mock.calls.length).toBe(1);

    testSlider.isVertical = false;
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