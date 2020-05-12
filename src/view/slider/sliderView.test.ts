// в тестах приходится хакать области видимости и не только
/* eslint-disable no-undef,dot-notation,@typescript-eslint/ban-ts-ignore */
import SliderView from './sliderView';
import View from '../defaultView';
import TooltipView from './handler/tooltip/tooltipView';
import MarkupView from './markup/markupView';

jest.mock('../defaultView');

const testView = new View(null, null);
Object.defineProperty(testView, 'body', {
  get(): HTMLElement {
    return document.body.appendChild(document.createElement('div'));
  },
  configurable: true,
});

testView.handlerPositionChanged = jest.fn(() => undefined);
let testSlider: SliderView;

function resetHTML(): void {
  document.body.innerHTML = '';
  Object.defineProperty(testView, 'body', {
    get(): HTMLElement {
      return document.body.appendChild(document.createElement('div'));
    },
  });
}

describe('Инициализация', () => {
  describe('Установка значений полей', () => {
    test('Без передачи необязательных параметров', () => {
      testSlider = new SliderView(testView);

      expect(testSlider.isVertical).toBe(undefined);
      expect(testSlider.isReversed).toBe(false);
      expect(testSlider['_tooltipsAlwaysVisible']).toBe(undefined);
      expect(testSlider['_withMarkup']).toBe(undefined);
    });
    test('С передачей необязательных параметров', () => {
      testSlider = new SliderView(
        testView, {
          isVertical: true, isReversed: false, showTooltips: false, withMarkup: true,
        },
      );

      expect(testSlider.isVertical).toBe(true);
      expect(testSlider.isReversed).toBe(false);
      expect(testSlider['_tooltipsAlwaysVisible']).toBe(false);
      expect(testSlider['_withMarkup']).toBe(true);
    });
  });

  test('Создание HTML-элементов', () => {
    resetHTML();
    testSlider = new SliderView(testView);

    const wrap = document.body.querySelector('.liquidSlider');
    const body = document.body.querySelector('.liquidSlider__body');
    const scale = document.body.querySelector('.liquidSlider__scale');
    const handlers = document.body.querySelector('.liquidSlider__handlers');

    expect(testSlider.bodyElement === testSlider['_elements'].body && testSlider['_elements'].body === body).toBeTruthy();
    expect(testSlider.handlersContainer === testSlider['_elements'].handlers && testSlider['_elements'].handlers === handlers).toBeTruthy();
    expect(testSlider['_elements'].wrap).toBe(wrap);
    expect(testSlider['_elements'].scale).toBe(scale);
  });

  test('Создание хэндлеров', () => {
    testSlider.isReversed = false;
    testSlider.initHandlers(
      {
        customHandlers: false,
        handlersArray: [
          { handlerIndex: 0, item: 'test', positionPart: 0.4 },
          { handlerIndex: 1, item: 'test2', positionPart: 0.9 },
        ],
      },
    );
    expect(testSlider.handlers[0].rangePair).toBe(1);
    expect(testSlider.handlers[1].rangePair).toBe(0);

    testSlider.isReversed = true;
    testSlider.initHandlers(
      {
        customHandlers: false,
        handlersArray: [
          { handlerIndex: 0, item: 'test', positionPart: 0.4 },
        ],
      },
    );
    expect(testSlider.handlers[0].rangePair).toBe('end');

    testSlider.isReversed = false;
    testSlider.initHandlers(
      {
        customHandlers: false,
        handlersArray: [
          { handlerIndex: 0, item: 'test', positionPart: 0.4 },
        ],
      },
    );
    expect(testSlider.handlers[0].rangePair).toBe('start');

    testSlider.initHandlers(
      {
        customHandlers: true,
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
    expect(testSlider.handlers[0].rangePair).toBe('start');
    expect(testSlider.handlers[1].rangePair).toBe(null);
    expect(testSlider.handlers[2].rangePair).toBe('end');
  });

  test('Связывание хэндлеров в диапазоны', () => {
    testSlider.isReversed = false;
    testSlider.initHandlers(
      {
        customHandlers: false,
        handlersArray: [
          { handlerIndex: 0, item: 'test', positionPart: 0.4 },
          { handlerIndex: 1, item: 'test2', positionPart: 0.9 },
        ],
      },
    );
    testSlider.createRanges();
    expect(testSlider['_ranges'][0].startHandler).toBe(testSlider.handlers[0]);
    expect(testSlider['_ranges'][0].endHandler).toBe(testSlider.handlers[1]);

    testSlider.isReversed = true;
    testSlider.initHandlers(
      {
        customHandlers: false,
        handlersArray: [
          { handlerIndex: 0, item: 'test', positionPart: 0.4 },
          { handlerIndex: 1, item: 'test2', positionPart: 0.9 },
        ],
      },
    );
    testSlider.clearRanges();
    testSlider.createRanges();
    expect(testSlider['_ranges'][0].startHandler).toBe(null);
    expect(testSlider['_ranges'][0].endHandler).toBe(testSlider.handlers[0]);
    expect(testSlider['_ranges'][1].startHandler).toBe(testSlider.handlers[1]);
    expect(testSlider['_ranges'][1].endHandler).toBe(null);

    testSlider.initHandlers({
      customHandlers: false,
      handlersArray: [
        { handlerIndex: 0, item: 'test', positionPart: 0.4 },
      ],
    });
    testSlider.clearRanges();
    testSlider.createRanges();
    expect(testSlider['_ranges'][0].startHandler).toBe(testSlider.handlers[0]);
    expect(testSlider['_ranges'][0].endHandler).toBe(null);

    // Кастомные
    testSlider.initHandlers(
      {
        customHandlers: true,
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
    testSlider.clearRanges();
    testSlider.createRanges();
    expect(testSlider['_ranges'][0].startHandler).toBe(null);
    expect(testSlider['_ranges'][0].endHandler).toBe(testSlider.handlers[0]);
    expect(testSlider['_ranges'][1].startHandler).toBe(testSlider.handlers[2]);
    expect(testSlider['_ranges'][1].endHandler).toBe(null);
    expect(testSlider['_ranges'][2]).toBe(undefined);
  });

  describe('Проверка слушателей событий', () => {
    beforeEach(() => {
      resetHTML();
      testSlider = new SliderView(testView);

      testSlider.bodyElement.style.width = '100px';
      testSlider.getScaleLength = (): number => 100;
      Object.defineProperty(testSlider, 'scaleStart', {
        get: jest.fn(() => 0),
      });

      testSlider.initHandlers(
        {
          customHandlers: false,
          handlersArray: [
            { handlerIndex: 0, item: 'test', positionPart: 0.4 },
            { handlerIndex: 1, item: 'test2', positionPart: 0.9 },
          ],
        },
      );
      Object.defineProperty(testSlider.handlers[0], 'positionCoordinate', {
        get: jest.fn(() => 40),
      });
      Object.defineProperty(testSlider.handlers[1], 'positionCoordinate', {
        get: jest.fn(() => 90),
      });
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
          if (testSlider.isVertical) {
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

          testSlider.bodyElement.dispatchEvent(testMouseDownEvent);
        };

        testClicks = (): void => {
          for (let i = 0; i <= 100; i += 1) {
            (testView.handlerPositionChanged as jest.Mock).mockClear();
            // несмотря на клик, позиции хэндлеров остаются неизменными,
            // потому что вью мокнут и нет обмена данными с моделью
            simulateMouseDown(i);

            if (i <= 65) expect(testSlider['_activeHandler']).toBe(testSlider.handlers[0]);
            else expect(testSlider['_activeHandler']).toBe(testSlider.handlers[1]);

            expect(testSlider['_activeHandler'].body).toBe(document.activeElement);

            if (
              (testSlider.calculateMouseRelativePos(testMouseDownEvent as MouseEvent) !== 0.4)
                && (testSlider.calculateMouseRelativePos(testMouseDownEvent as MouseEvent) !== 0.9)
            ) {
              expect(testView.handlerPositionChanged).toBeCalledWith(
                testSlider['_activeHandler'].index, i / 100,
              );
            }

            // видимость тултипов
            if (testSlider['_tooltipsAlwaysVisible']) {
              expect(testSlider['_activeHandler'].tooltip.element.classList)
                .toContain(`${TooltipView.DEFAULT_CLASS}_visible`);
            } else if (testSlider['_tooltipsAlwaysVisible'] !== undefined) {
              // если значение передано и оно FALSE
              // проверяем, что на неактивных хэндлерах тултипы не видны
              // eslint-disable-next-line no-loop-func
              testSlider.handlers.forEach((handler) => {
                if (handler !== testSlider['_activeHandler']) {
                  expect(handler.tooltip.element.classList)
                    .toContain(`${TooltipView.DEFAULT_CLASS}_hidden`);
                }
              });
            }
          }
        };
      });

      beforeEach(() => {
        (spyOnPreventDefault as jest.Mock).mockClear();
      });

      test('По слайдеру', () => {
        testSlider.setOrientation(false);
        testClicks();

        testSlider.setOrientation(true);
        testClicks();

        // задиспатчить ивент не придумал как - таргет только для чтения.
        // А диспатчить надо с документа, но так, чтобы таргет был чем-то внутри слайдера
        // (вызов по координатам слайдера не прокатил)
        // @ts-ignore
        testSlider['_handleDocumentMouseDown']({ target: testSlider['_elements'].scale });

        expect(spyOnPreventDefault).toBeCalled();
        expect(testSlider['_activeHandler'].body).toBe(document.activeElement); // проверка фокуса на активном хэндлере
      });

      test('Вне слайдера', () => {
        testSlider.setTooltipsVisibility(false);

        document.body.dispatchEvent(testMouseDownEvent);
        expect(testSlider['_activeHandler']).toBe(null); // если изначально активного хэндлера нет

        simulateMouseDown(0);

        document.body.dispatchEvent(testMouseDownEvent);
        expect(testSlider['_activeHandler']).toBe(null); // если был активный хэндлер
      });
    });

    describe('Движение мыши', () => {
      test('Проверка срабатывания только при зажатии кнопки мыши', () => {
        const testMouseMoveEvent = new Event('mousemove');
        const testMouseDownEvent = new Event('mousedown');
        // @ts-ignore
        testMouseMoveEvent.clientX = 40;
        // @ts-ignore
        testMouseMoveEvent.clientY = 40;
        // @ts-ignore
        testMouseDownEvent.clientX = 40;
        // @ts-ignore
        testMouseDownEvent.clientY = 40;

        const testMouseUpEvent = new Event('mouseup');
        // @ts-ignore
        const spyMouseMoveHandler = jest.spyOn(testSlider, '_handleMouseMoveBound');

        document.body.dispatchEvent(testMouseMoveEvent);
        // до нажатия не вызывается обработчик события движения
        expect(spyMouseMoveHandler).not.toBeCalled();
        testSlider.bodyElement.dispatchEvent(testMouseDownEvent);
        spyMouseMoveHandler.mockClear();
        document.body.dispatchEvent(testMouseMoveEvent);
        // после нажатия, но до отпускания - вызывается
        expect(spyMouseMoveHandler).toBeCalled();

        document.body.dispatchEvent(testMouseUpEvent);
        spyMouseMoveHandler.mockClear();
        document.body.dispatchEvent(testMouseMoveEvent);
        // после отпускания мыши - снова не вызывается
        expect(spyMouseMoveHandler).not.toBeCalled();
      });

      test('Выход за пределы окна браузера', () => {
        const testMouseMoveEvent = new Event('mousemove');
        const testMouseDownEvent = new Event('mousedown');
        // @ts-ignore
        testMouseDownEvent.clientX = 40;
        // @ts-ignore
        testMouseDownEvent.clientY = 40;
        // @ts-ignore
        const spyMouseMoveHandler = jest.spyOn(testSlider, '_handleMouseMoveBound');

        spyMouseMoveHandler.mockClear();
        testSlider.bodyElement.dispatchEvent(testMouseDownEvent);
        document.body.dispatchEvent(testMouseMoveEvent);
        expect(spyMouseMoveHandler).toBeCalled();

        spyMouseMoveHandler.mockClear();
        // @ts-ignore
        // нас интересует только это свойство
        testSlider['_handleWindowMouseOut']({ target: { nodeName: 'not-HTML' } });
        document.body.dispatchEvent(testMouseMoveEvent);
        expect(spyMouseMoveHandler).toBeCalled();

        spyMouseMoveHandler.mockClear();
        // @ts-ignore
        // нас интересует только это свойство
        testSlider['_handleWindowMouseOut']({ target: { nodeName: 'HTML' } });
        document.body.dispatchEvent(testMouseMoveEvent);
        expect(spyMouseMoveHandler).not.toBeCalled();
      });
    });
  });
});

describe('Функции', () => {
  beforeAll(() => {
    resetHTML();
    testSlider = new SliderView(testView);

    testSlider.initHandlers(
      {
        customHandlers: false,
        handlersArray: [
          { handlerIndex: 0, item: 'test', positionPart: 0.4 },
          { handlerIndex: 1, item: 'test2', positionPart: 0.9 },
        ],
      },
    );
  });

  test('Установка видимости тултипов', () => {
    const spyHandlersSetVisibility = testSlider.handlers.map((handler) => jest.spyOn(handler, 'setTooltipVisibility'));

    function testTooltipsVisibilityVarSetting(stateToSet: boolean): void {
      testSlider.setTooltipsVisibility(stateToSet);
      const stateToCheck = (stateToSet === undefined) || (stateToSet === null)
        ? testSlider['_tooltipsAlwaysVisible'] : stateToSet;
      expect(testSlider['_tooltipsAlwaysVisible']).toBe(stateToCheck);

      spyHandlersSetVisibility.forEach((spyFunc) => {
        // проверка вызова функции у каждого тултипа с обработанным значением
        expect(spyFunc).toBeCalledWith(stateToCheck);
      });
    }

    testTooltipsVisibilityVarSetting(true);
    testTooltipsVisibilityVarSetting(false);
    testTooltipsVisibilityVarSetting(null);
    testTooltipsVisibilityVarSetting(undefined);
  });

  test('Создание разметки', async () => {
    testSlider.isVertical = false;
    const origGetScaleLength = testSlider.getScaleLength;
    const mockAddMark = jest.fn();
    MarkupView.prototype.addMark = mockAddMark;

    testSlider['_markup'] = undefined;
    testSlider.update(); // грубо говоря тест на то, что нет исключения

    testSlider.clearRanges();
    testSlider['_withMarkup'] = true;
    testSlider.initHandlers({
      customHandlers: false,
      handlersArray: [{ handlerIndex: 0, item: 'test', positionPart: 0.5 }],
    });
    testSlider.getScaleLength = (): number => 100;

    expect(testSlider['_markup']?.ownerSlider).toBe(testSlider);
    await new Promise((resolve) => requestAnimationFrame(() => {
      resolve();
    }));

    const marksCount = 1 / testSlider['_step'] + 1; // 1 - потому что во View относительные величины от 0 до 1. А +1 - потому что включая нулевую отметку
    expect(mockAddMark.mock.calls.length).toBe(marksCount);
    for (let i = 1; i < marksCount; i += 1) {
      expect(mockAddMark).toBeCalledWith(Number.parseFloat((testSlider['_step'] * i).toFixed(4)), 0);
    }

    testSlider.getScaleLength = origGetScaleLength;
  });

  test('Установка данных хэндлеров', () => {
    testSlider.initHandlers({
      customHandlers: false,
      handlersArray: [{ handlerIndex: 0, item: 'test', positionPart: 0.5 }, {
        handlerIndex: 2,
        item: 'test2',
        positionPart: 1,
      }],
    });
    const spySetValue1 = jest.spyOn(testSlider.handlers[0], 'setValue');
    const spySetValue2 = jest.spyOn(testSlider.handlers[1], 'setValue');
    const spySetPosition1 = jest.spyOn(testSlider.handlers[0], 'setPosition');
    const spySetPosition2 = jest.spyOn(testSlider.handlers[1], 'setPosition');

    const newValue1 = 'new test';
    const newValue2 = 'new test2';
    const newPosition1 = 0.1;
    const
      newPosition2 = 0.8;
    testSlider.setHandlersData([
      { index: 0, item: newValue1, relativeValue: newPosition1 },
      { index: 22, item: newValue2, relativeValue: newPosition2 },
    ]);

    expect(spySetValue1).toBeCalledWith(newValue1);
    expect(spySetValue2).not.toBeCalled();

    expect(spySetPosition1).toBeCalledWith(newPosition1);
    expect(spySetPosition2).not.toBeCalled();
  });

  test('Обновление данных слайдера', () => {
    testSlider.createRanges();

    const spies: jest.SpyInstance[] = [];
    testSlider['_ranges'].forEach((range) => {
      spies.push(jest.spyOn(range, 'refreshPosition'));
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

    let prevStep = testSlider['_step'];
    let prevMin = testSlider['_min'];
    let prevMax = testSlider['_max'];
    let prevVerticality = testSlider.isVertical;
    let prevTooltipVisibility = testSlider['_tooltipsAlwaysVisible'];
    let prevMarkupVisibility = testSlider['_withMarkup'];

    function checkOldValues(): void {
      expect(testSlider['_step']).toBe(prevStep);
      expect(testSlider['_min']).toBe(prevMin);
      expect(testSlider['_max']).toBe(prevMax);
      expect(testSlider.isVertical).toBe(prevVerticality);
      expect(testSlider['_tooltipsAlwaysVisible']).toBe(prevTooltipVisibility);
      expect(testSlider['_withMarkup']).toBe(prevMarkupVisibility);
    }

    mockClearSpies(spies);
    testSlider.update({});
    checkSpiesToBeCalledOnce(spies);
    checkOldValues();

    mockClearSpies(spies);
    testSlider.update({
      step: 2, min: -2, max: 22, isVertical: false, tooltipsVisible: false, withMarkup: true,
    });
    checkSpiesToBeCalledOnce(spies);
    expect(testSlider['_step']).toBe(2);
    expect(testSlider['_min']).toBe(-2);
    expect(testSlider['_max']).toBe(22);
    expect(testSlider.isVertical).toBe(false);
    expect(testSlider['_tooltipsAlwaysVisible']).toBe(false);
    expect(testSlider['_withMarkup']).toBe(true);

    prevStep = testSlider['_step'];
    prevMin = testSlider['_min'];
    prevMax = testSlider['_max'];
    prevVerticality = testSlider.isVertical;
    prevTooltipVisibility = testSlider['_tooltipsAlwaysVisible'];
    prevMarkupVisibility = testSlider['_withMarkup'];

    mockClearSpies(spies);
    testSlider.update({ step: null });
    checkSpiesToBeCalledOnce(spies);
    checkOldValues();
  });

  test('Добавление пользовательского слушателя на стандартный обработчик нажатия кнопки мыши', () => {
    const mockListener = jest.fn();
    const testEvent = new Event('mousedown');

    testSlider.addOnMouseDownListener(mockListener);
    testSlider['_elements'].body.dispatchEvent(testEvent);
    expect(mockListener).toBeCalledWith(testEvent);
  });

  test('Добавление нового хэндлера', () => {
    const prevHandlers = [...testSlider.handlers];
    const prevRanges = [...testSlider['_ranges']];
    testSlider.addHandler(null);
    expect(testSlider.handlers).toStrictEqual(prevHandlers);

    const testParams = {
      positionPart: 0.2, item: 'hello', handlerIndex: 33, rangePair: null as number,
    };
    testSlider.addHandler(testParams);
    const newStartHandler = testSlider.handlers[testSlider.handlers.length - 1];
    expect(testSlider.handlers.length === prevHandlers.length + 1).toBeTruthy();
    expect(newStartHandler.positionPart).toBe(testParams.positionPart);
    expect(newStartHandler.value).toBe(testParams.item);
    expect(newStartHandler.index).toBe(testParams.handlerIndex);
    expect(newStartHandler.rangePair).toBe(testParams.rangePair);
    expect(testSlider['_ranges']).toStrictEqual(prevRanges);

    testParams.handlerIndex = 22;
    testParams.rangePair = 33;
    testParams.positionPart = 0.3;
    testSlider.addHandler(testParams);
    const newEndHandler = testSlider.handlers[testSlider.handlers.length - 1];
    const newRange = testSlider['_ranges'][testSlider['_ranges'].length - 1];
    expect(newRange.startHandler).toBe(newStartHandler);
    expect(newRange.endHandler).toBe(newEndHandler);
  });

  test('Удаление хэндлера', () => {
    const prevHandlers = [...testSlider.handlers];
    const prevRanges = [...testSlider['_ranges']];

    // хэндлер без диапазона
    const testParams = {
      positionPart: 0.2, item: 'hello', handlerIndex: 44, rangePair: null as number,
    };
    testSlider.addHandler(testParams);
    testSlider.removeHandler(44);
    expect(testSlider.handlers).toStrictEqual(prevHandlers);

    // с диапазоном
    testSlider.addHandler(testParams);
    expect(testSlider['_ranges']).toStrictEqual(prevRanges);
    testParams.handlerIndex = 55;
    testParams.rangePair = 44;
    testParams.positionPart = 0.9;
    testSlider.addHandler(testParams);
    expect(testSlider['_ranges'].length === prevRanges.length + 1).toBeTruthy();

    testSlider.removeHandler(44);
    expect(testSlider['_ranges']).toStrictEqual(prevRanges);
  });

  test('Получение начала шкалы', () => {
    const oldGetBoundingClientRect = testSlider['_elements'].scale.getBoundingClientRect;
    testSlider['_elements'].scale.getBoundingClientRect = jest.fn(() => ({
      toJSON: undefined,
      height: 0,
      width: 0,
      x: 0,
      y: 0,
      bottom: 0,
      right: 0,
      left: 1,
      top: 2, // нас интересуют эти свойства
    }));
    testSlider.isVertical = false;
    expect(testSlider.scaleStart).toBe(1);

    testSlider.isVertical = true;
    expect(testSlider.scaleStart).toBe(2);

    testSlider['_elements'].scale.getBoundingClientRect = oldGetBoundingClientRect;
  });

  test('Получение Конца шкалы', () => {
    const oldGetBoundingClientRect = testSlider['_elements'].scale.getBoundingClientRect;
    testSlider['_elements'].scale.getBoundingClientRect = jest.fn(() => ({
      toJSON: undefined,
      height: 0,
      width: 0,
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      bottom: 3,
      right: 4, // нас интересуют эти свойства
    }));
    testSlider.isVertical = false;
    expect(testSlider.scaleEnd).toBe(4);

    testSlider.isVertical = true;
    expect(testSlider.scaleEnd).toBe(3);

    testSlider['_elements'].scale.getBoundingClientRect = oldGetBoundingClientRect;
  });
});
