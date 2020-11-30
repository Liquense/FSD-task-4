/* eslint-disable dot-notation,@typescript-eslint/ban-ts-ignore */
import { DEFAULT_SLIDER_PARAMS } from '../constants';

import { HandlerViewParams } from './types';
import SliderView from './SliderView';
import Controller from '../controller/Controller';

import HandlerView from './handler/HandlerView';
import RangeView from './range/RangeView';
import { Observer } from '../utils/Observer/Observer';

import TooltipView from './handler/tooltip/TooltipView';

jest.mock('../controller/Controller');
jest.mock('./scale/ScaleView');
jest.mock('./markup/MarkupView');

let testSlider: SliderView;
let sliderWrap = document.body.appendChild(document.createElement('div'));
const mockController = new Controller(sliderWrap);
mockController['addDefaultListeners'] = jest.fn(
  () => Observer.addListener(
    'handleMouseMove', testSlider, mockController['passHandlerPositionChange'],
  ),
);

mockController['passHandlerPositionChange'] = jest.fn(() => null);

function resetHTML(): void {
  document.body.innerHTML = '';
  sliderWrap = document.body.appendChild(document.createElement('div'));
}
const defaultParams = { ...DEFAULT_SLIDER_PARAMS, ...{ range: 10, stepPart: 0.1 } };

describe('Инициализация', () => {
  test('Установка значений полей', () => {
    testSlider = new SliderView(
      sliderWrap, {
        ...DEFAULT_SLIDER_PARAMS,
        ...{
          range: 10,
          stepPart: 0.1,
          isVertical: true,
          isInverted: false,
          isTooltipsVisible: false,
          isMarkupVisible: true,
        },
      },
    );
    expect(testSlider['isRangesInverted']).toBe(false);
    expect(testSlider['isTooltipsAlwaysVisible']).toBe(false);
    expect(testSlider['isMarkupVisible']).toBe(true);
  });

  test('Создание HTML-элементов', () => {
    resetHTML();
    testSlider = new SliderView(sliderWrap, defaultParams);

    const wrap = document.body.querySelector('.liquid-slider');
    const scale = document.body.querySelector('.liquid-slider__scale');
    expect(testSlider['elements'].wrap).toBe(wrap);
    expect(testSlider['elements'].scale).toBe(scale);
  });

  test('Создание хэндлеров', () => {
    testSlider['isRangesInverted'] = false;
    testSlider.initHandlers(
      {
        isCustomHandlers: false,
        handlersArray: [
          {
            handlerIndex: 0, item: 'test', positionPart: 0.4,
          },
          {
            handlerIndex: 1, item: 'test2', positionPart: 0.9,
          },
        ],
      },
    );
    expect(testSlider['handlers'][0].getPair()).toBe(1);
    expect(testSlider['handlers'][1].getPair()).toBe(0);

    testSlider['isRangesInverted'] = true;
    testSlider.initHandlers(
      {
        isCustomHandlers: false,
        handlersArray: [
          {
            handlerIndex: 0, item: 'test', positionPart: 0.4,
          },
        ],
      },
    );
    expect(testSlider['handlers'][0].getPair()).toBe('end');

    testSlider['isRangesInverted'] = false;
    testSlider.initHandlers(
      {
        isCustomHandlers: false,
        handlersArray: [
          {
            handlerIndex: 0, item: 'test', positionPart: 0.4,
          },
        ],
      },
    );
    expect(testSlider['handlers'][0].getPair()).toBe('start');

    testSlider.initHandlers(
      {
        isCustomHandlers: true,
        handlersArray: [
          {
            handlerIndex: 0, item: 'test', positionPart: 0.4, rangePair: 'start',
          },
          {
            handlerIndex: 1, item: 'test', positionPart: 0.9, rangePair: null,
          },
          {
            handlerIndex: 2, item: 'test', positionPart: 0.7, rangePair: 'end',
          },
        ],
      },
    );
    expect(testSlider['handlers'][0].getPair()).toBe('start');
    expect(testSlider['handlers'][1].getPair()).toBe(null);
    expect(testSlider['handlers'][2].getPair()).toBe('end');
  });

  describe('Связывание хэндлеров в диапазоны', () => {
    describe('Стандартные', () => {
      test('Без инверсии диапазонов', () => {
        testSlider['isRangesInverted'] = false;
        testSlider.initHandlers({
          isCustomHandlers: false,
          handlersArray: [
            { handlerIndex: 0, item: 'test', positionPart: 0.4 },
            { handlerIndex: 1, item: 'test2', positionPart: 0.9 },
          ],
        });
        testSlider['createRanges']();
        expect(testSlider['ranges'][0].getStartHandler()).toBe(testSlider['handlers'][0]);
        expect(testSlider['ranges'][0].getEndHandler()).toBe(testSlider['handlers'][1]);
      });

      test('С инверсией диапазонов', () => {
        testSlider['isRangesInverted'] = true;
        testSlider.initHandlers({
          isCustomHandlers: false,
          handlersArray: [
            { handlerIndex: 0, item: 'test', positionPart: 0.4 },
            { handlerIndex: 1, item: 'test2', positionPart: 0.9 },
          ],
        });
        testSlider['clearRanges']();
        testSlider['createRanges']();
        expect(testSlider['ranges'][0].getStartHandler()).toBe(null);
        expect(testSlider['ranges'][0].getEndHandler()).toBe(testSlider['handlers'][0]);
        expect(testSlider['ranges'][1].getStartHandler()).toBe(testSlider['handlers'][1]);
        expect(testSlider['ranges'][1].getEndHandler()).toBe(null);
      });

      test('Один хэндлер', () => {
        testSlider.initHandlers({
          isCustomHandlers: false,
          handlersArray: [
            { handlerIndex: 0, item: 'test', positionPart: 0.4 },
          ],
        });
        testSlider['clearRanges']();
        testSlider['createRanges']();
        expect(testSlider['ranges'][0].getStartHandler()).toBe(testSlider['handlers'][0]);
        expect(testSlider['ranges'][0].getEndHandler()).toBe(null);
      });
    });

    test('Пользовательские', () => {
      testSlider.initHandlers({
        isCustomHandlers: true,
        handlersArray: [
          {
            handlerIndex: 0, item: 'test', positionPart: 0.4, rangePair: 'start',
          },
          {
            handlerIndex: 1, item: 'test', positionPart: 0.9, rangePair: null,
          },
          {
            handlerIndex: 2, item: 'test', positionPart: 0.7, rangePair: 'end',
          },
        ],
      });
      testSlider['clearRanges']();
      testSlider['createRanges']();
      expect(testSlider['ranges'][0].getStartHandler()).toBe(null);
      expect(testSlider['ranges'][0].getEndHandler()).toBe(testSlider['handlers'][0]);
      expect(testSlider['ranges'][1].getStartHandler()).toBe(testSlider['handlers'][2]);
      expect(testSlider['ranges'][1].getEndHandler()).toBe(null);
      expect(testSlider['ranges'][2]).toBe(undefined);
    });
  });

  describe('Проверка слушателей событий', () => {
    beforeEach(() => {
      resetHTML();
      testSlider = new SliderView(sliderWrap, defaultParams);

      testSlider['elements'].body.style.width = '100px';
      testSlider['getScaleLength'] = jest.fn(() => 100);
      testSlider['getScaleStart'] = jest.fn(() => 0);

      testSlider.initHandlers(
        {
          isCustomHandlers: false,
          handlersArray: [
            { handlerIndex: 0, item: 'test', positionPart: 0.4 },
            { handlerIndex: 1, item: 'test2', positionPart: 0.9 },
          ],
        },
      );
      testSlider['handlers'][0].getPositionCoordinate = jest.fn(() => 40);
      testSlider['handlers'][1].getPositionCoordinate = jest.fn(() => 90);
    });

    describe('Нажатие на кнопку мыши', () => {
      let testClicks: Function;
      let simulateMouseDown: Function;
      let spyOnPreventDefault: jest.SpyInstance;
      let testMouseDownEvent: MouseEvent;

      beforeAll(() => {
        testMouseDownEvent = new MouseEvent('mousedown');
        spyOnPreventDefault = jest.spyOn(testMouseDownEvent, 'preventDefault');

        simulateMouseDown = (coordinate: number): void => {
          if (testSlider['isVertical']) {
            Object.defineProperty(testMouseDownEvent, 'clientY', {
              get(): number { return coordinate; },
              configurable: true,
            });
          } else {
            Object.defineProperty(testMouseDownEvent, 'clientX', {
              get(): number { return coordinate; },
              configurable: true,
            });
          }

          testSlider['elements'].body.dispatchEvent(testMouseDownEvent);
        };

        testClicks = (): void => {
          const checkDisabledTooltipsVisibility = (handler: HandlerView): void => {
            if (handler !== testSlider['activeHandler']) {
              expect(handler.getTooltipElement().classList)
                .toContain(`${TooltipView.DEFAULT_CLASS}_hidden`);
            }
          };

          new Array(100).fill(0).forEach((handler, i) => {
            // несмотря на клик, позиции хэндлеров остаются неизменными,
            // потому что вью мокнут и нет обмена данными с моделью
            testSlider['scale'].calculateMouseRelativePosition = jest.fn(() => i / 100);
            (mockController['passHandlerPositionChange'] as jest.Mock).mockClear();
            simulateMouseDown(i);

            if (i <= 65) expect(testSlider['activeHandler']).toBe(testSlider['handlers'][0]);
            else expect(testSlider['activeHandler']).toBe(testSlider['handlers'][1]);

            expect(testSlider['activeHandler'].getHandlerBody()).toBe(document.activeElement);

            if ((testSlider['calculateMouseRelativePosition'](testMouseDownEvent) !== 0.4)
                && (testSlider['calculateMouseRelativePosition'](testMouseDownEvent) !== 0.9)) {
              expect(mockController['passHandlerPositionChange']).toBeCalledWith(
                { handlerIndex: testSlider['activeHandler'].getIndex(), position: i / 100 },
              );
            }

            if (testSlider['isTooltipsAlwaysVisible']) {
              expect(testSlider['activeHandler'].getTooltipElement().classList)
                .toContain(`${TooltipView.DEFAULT_CLASS}_visible`);
            } else if (testSlider['isTooltipsAlwaysVisible'] !== undefined) {
              testSlider['handlers'].forEach(checkDisabledTooltipsVisibility);
            }
          });
        };
      });

      beforeEach(() => {
        (spyOnPreventDefault as jest.Mock).mockClear();
      });

      test('По слайдеру', () => {
        mockController['addDefaultListeners']();
        testSlider.update({ isVertical: false, stepPart: 0.01 });
        testClicks();

        testSlider['setOrientation'](true);
        testClicks();

        testSlider['elements'].body.dispatchEvent(new Event('click'));

        expect(spyOnPreventDefault).toBeCalled();
        expect(testSlider['activeHandler'].getHandlerBody()).toBe(document.activeElement);
      });

      describe('Вне слайдера', () => {
        test('если изначально активного хэндлера нет', () => {
          document.body.dispatchEvent(testMouseDownEvent);
          expect(testSlider['activeHandler']).toBe(null);
        });

        test('если был активный хэндлер', () => {
          simulateMouseDown(0);
          document.body.dispatchEvent(testMouseDownEvent);
          expect(testSlider['activeHandler']).toBe(null);
        });
      });
    });

    describe('Движение мыши', () => {
      let testMouseMoveEvent: Event;
      let testMouseDownEvent: Event;
      let testMouseUpEvent: Event;
      let spyMouseMoveHandler: jest.Mock;

      beforeAll(() => {
        testMouseMoveEvent = new Event('mousemove');
        testMouseDownEvent = new Event('mousedown');
        testMouseUpEvent = new Event('mouseup');

        // @ts-ignore
        testMouseMoveEvent.clientX = 40;
        // @ts-ignore
        testMouseMoveEvent.clientY = 40;
        // @ts-ignore
        testMouseDownEvent.clientX = 40;
        // @ts-ignore
        testMouseDownEvent.clientY = 40;
      });

      beforeEach(() => {
        // @ts-ignore
        spyMouseMoveHandler = jest.spyOn(testSlider, 'handleMouseMove');
      });

      describe('Проверка срабатывания только при зажатии кнопки мыши', () => {
        test('До зажатия кнопки мыши обработчик перемещения не срабатывает', () => {
          document.body.dispatchEvent(testMouseMoveEvent);
          expect(spyMouseMoveHandler).not.toBeCalled();
        });

        test('Во время зажатия обработчик срабатывает', () => {
          testSlider['elements'].body.dispatchEvent(testMouseDownEvent);
          document.body.dispatchEvent(testMouseMoveEvent);
          expect(spyMouseMoveHandler).toBeCalled();
        });

        test('После отпускания снова не срабатывает', () => {
          document.body.dispatchEvent(testMouseUpEvent);
          document.body.dispatchEvent(testMouseMoveEvent);
          expect(spyMouseMoveHandler).not.toBeCalled();
        });
      });

      test('Выход за пределы окна браузера', () => {
        testSlider['elements'].body.dispatchEvent(testMouseDownEvent);
        document.body.dispatchEvent(testMouseMoveEvent);
        expect(spyMouseMoveHandler).toBeCalled();

        spyMouseMoveHandler.mockClear();
        // @ts-ignore
        testSlider['handleWindowMouseOut']({ target: { nodeName: 'not-HTML' } });
        document.body.dispatchEvent(testMouseMoveEvent);
        expect(spyMouseMoveHandler).toBeCalled();

        spyMouseMoveHandler.mockClear();
        // @ts-ignore
        testSlider['handleWindowMouseOut']({ target: { nodeName: 'HTML' } });
        document.body.dispatchEvent(testMouseMoveEvent);
        expect(spyMouseMoveHandler).not.toBeCalled();
      });
    });
  });
});

describe('Функции', () => {
  beforeAll(() => {
    resetHTML();
    testSlider = new SliderView(sliderWrap, defaultParams);

    testSlider.initHandlers({
      isCustomHandlers: false,
      handlersArray: [
        { handlerIndex: 0, item: 'test', positionPart: 0.4 },
        { handlerIndex: 1, item: 'test2', positionPart: 0.9 },
      ],
    });
  });

  test('Установка видимости тултипов', () => {
    const spyHandlersSetVisibility = testSlider['handlers'].map((handler) => jest.spyOn(handler, 'setTooltipVisibility'));

    function testTooltipsVisibilityVarSetting(stateToSet: boolean): void {
      testSlider['setTooltipsVisibility'](stateToSet);
      const stateToCheck = stateToSet ?? testSlider['isTooltipsAlwaysVisible'];
      expect(testSlider['isTooltipsAlwaysVisible']).toBe(stateToCheck);

      spyHandlersSetVisibility.forEach((spyFunc) => {
        expect(spyFunc).toBeCalledWith(stateToCheck);
      });
    }

    testTooltipsVisibilityVarSetting(true);
    testTooltipsVisibilityVarSetting(false);
    testTooltipsVisibilityVarSetting(null);
    testTooltipsVisibilityVarSetting(undefined);
  });

  test('Создание разметки', async () => {
    testSlider.update({ isMarkupVisible: true });
    expect(testSlider['markup'].createMarks).toBeCalledTimes(1);
    (testSlider['markup'].createMarks as jest.Mock).mockClear();

    testSlider.initHandlers({ isCustomHandlers: false, handlersArray: [] });
    expect(testSlider['markup'].createMarks).toBeCalledTimes(1);
  });

  test('Установка данных хэндлеров', () => {
    testSlider.initHandlers({
      isCustomHandlers: false,
      handlersArray: [{ handlerIndex: 0, item: 'test', positionPart: 0.5 }, {
        handlerIndex: 2,
        item: 'test2',
        positionPart: 1,
      }],
    });
    const spySetValue1 = jest.spyOn(testSlider['handlers'][0], 'setItem');
    const spySetValue2 = jest.spyOn(testSlider['handlers'][1], 'setItem');
    const spySetPosition1 = jest.spyOn(testSlider['handlers'][0], 'setPosition');
    const spySetPosition2 = jest.spyOn(testSlider['handlers'][1], 'setPosition');

    const newValue1 = 'new test';
    const newValue2 = 'new test2';
    const newPosition1 = 0.1;
    const newPosition2 = 0.8;
    (testSlider['scale'].getWorkZoneLength as jest.Mock).mockImplementationOnce(() => 90);

    testSlider.setHandlersData([
      {
        handlerIndex: 0, item: newValue1, positionPart: newPosition1, itemIndex: 0,
      },
      {
        handlerIndex: 22, item: newValue2, positionPart: newPosition2, itemIndex: 1,
      },
    ]);

    expect(spySetValue1).toBeCalledWith(newValue1);
    expect(spySetValue2).not.toBeCalled();

    expect(spySetPosition1).toBeCalledWith({
      expandDimension: 'width',
      offsetDirection: 'left',
      workZoneLength: 90,
      positionPart: newPosition1,
    });
    expect(spySetPosition2).not.toBeCalled();
  });

  test('Обновление данных слайдера', () => {
    testSlider['createRanges']();

    const spies: jest.SpyInstance[] = [];
    testSlider['ranges'].forEach((range) => {
      spies.push(jest.spyOn(range, 'updatePosition'));
    });

    function mockClearSpies(spyInstances: jest.SpyInstance[]): void {
      spyInstances.forEach((spy) => {
        spy.mockClear();
      });
    }

    function checkSpiesToBeCalledOnce(spyInstances: jest.SpyInstance[]): void {
      spyInstances.forEach((spy) => {
        expect(spy).toBeCalled();
      });
    }

    let prevStep = testSlider['stepPart'];
    let prevMin = testSlider['minIndex'];
    let prevMax = testSlider['maxIndex'];
    let prevTooltipVisibility = testSlider['isTooltipsAlwaysVisible'];
    let prevMarkupVisibility = testSlider['isMarkupVisible'];

    function checkOldValues(): void {
      expect(testSlider['stepPart']).toBe(prevStep);
      expect(testSlider['minIndex']).toBe(prevMin);
      expect(testSlider['maxIndex']).toBe(prevMax);
      expect(testSlider['isTooltipsAlwaysVisible']).toBe(prevTooltipVisibility);
      expect(testSlider['isMarkupVisible']).toBe(prevMarkupVisibility);
    }

    mockClearSpies(spies);
    testSlider.update({});
    checkSpiesToBeCalledOnce(spies);
    checkOldValues();

    mockClearSpies(spies);
    testSlider.update({
      stepPart: 2,
      min: -2,
      max: 22,
      isVertical: false,
      isTooltipsVisible: false,
      isMarkupVisible: true,
    });
    checkSpiesToBeCalledOnce(spies);
    expect(testSlider['stepPart']).toBe(2);
    expect(testSlider['minIndex']).toBe(-2);
    expect(testSlider['maxIndex']).toBe(22);
    expect(testSlider['isTooltipsAlwaysVisible']).toBe(false);
    expect(testSlider['isMarkupVisible']).toBe(true);

    prevStep = testSlider['stepPart'];
    prevMin = testSlider['minIndex'];
    prevMax = testSlider['maxIndex'];
    prevTooltipVisibility = testSlider['isTooltipsAlwaysVisible'];
    prevMarkupVisibility = testSlider['isMarkupVisible'];

    mockClearSpies(spies);
    testSlider.update({ stepPart: null });
    checkSpiesToBeCalledOnce(spies);
    checkOldValues();
  });

  test('Добавление нового хэндлера', () => {
    const prevHandlers = [...testSlider['handlers']];
    const prevRanges = [...testSlider['ranges']];
    const testParams: HandlerViewParams = {
      positionPart: 0.2, item: 'hello', handlerIndex: 33, rangePair: null,
    };

    testSlider.addHandler(testParams);
    const newStartHandler = testSlider['handlers'][testSlider['handlers'].length - 1];
    expect(testSlider['handlers'].length === prevHandlers.length + 1).toBeTruthy();
    expect(newStartHandler.getPositionPart()).toBe(testParams.positionPart);
    expect(newStartHandler.getItem()).toBe(testParams.item);
    expect(newStartHandler.getIndex()).toBe(testParams.handlerIndex);
    expect(newStartHandler.getPair()).toBe(testParams.rangePair);
    expect(testSlider['ranges']).toStrictEqual(prevRanges);

    testParams.handlerIndex = 22;
    testParams.rangePair = 33;
    testParams.positionPart = 0.3;
    testSlider.addHandler(testParams);
    const newEndHandler = testSlider['handlers'][testSlider['handlers'].length - 1];
    const newRange = testSlider['ranges'][testSlider['ranges'].length - 1];
    expect(newRange.getStartHandler()).toBe(newStartHandler);
    expect(newRange.getEndHandler()).toBe(newEndHandler);
  });

  describe('Удаление хэндлера', () => {
    let prevHandlers: HandlerView[];
    let prevRanges: RangeView[];
    const testParams: HandlerViewParams = {
      positionPart: 0.2, item: 'hello', handlerIndex: 44, rangePair: null,
    };

    beforeAll(() => {
      prevHandlers = [...testSlider['handlers']];
      prevRanges = [...testSlider['ranges']];
    });

    test('Без диапазона', () => {
      testSlider.addHandler(testParams);
      testSlider.removeHandler(44);
      expect(testSlider['handlers']).toStrictEqual(prevHandlers);
    });

    test('С диапазоном', () => {
      testSlider.addHandler(testParams);
      expect(testSlider['ranges']).toStrictEqual(prevRanges);
      testParams.handlerIndex = 55;
      testParams.rangePair = 44;
      testParams.positionPart = 0.9;
      testSlider.addHandler(testParams);
      expect(testSlider['ranges'].length === prevRanges.length + 1).toBeTruthy();

      testSlider.removeHandler(44);
      expect(testSlider['ranges']).toStrictEqual(prevRanges);
    });
  });

  test('Получение начала шкалы', () => {
    (testSlider['scale'].getStart as jest.Mock).mockImplementationOnce(() => 2);
    testSlider['setOrientation'](true);
    expect(testSlider['getScaleStart']()).toBe(2);
  });

  test('Получение Конца шкалы', () => {
    (testSlider['scale'].getEnd as jest.Mock).mockImplementationOnce(() => 3);
    testSlider['setOrientation'](true);
    expect(testSlider['getScaleEnd']()).toBe(3);
  });
});
