import { Observer } from './Observer';
import { Observable } from './interfaces';

describe('Слушатель', () => {
  class TestContext implements Observable {
    public observers: { [key: string]: Observer } = { testExecutor: new Observer() };

    testExecutor(): void {
      if (this.observers.testExecutor) {
        this.observers.testExecutor.callListeners();
      }
    }
  }

  let spyTestExecutor: jest.SpyInstance;
  let testListener: jest.Mock;
  let secondTestListener: jest.Mock;
  let testContext: TestContext;

  let spyExecutorCalls = 0;
  let testListenerCalls = 0;
  let secondTestListenerCalls = 0;

  function testCalls(): void {
    expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
    expect(testListener).toBeCalledTimes(testListenerCalls);
    expect(secondTestListener).toBeCalledTimes(secondTestListenerCalls);
  }

  beforeAll(() => {
    testContext = new TestContext();
    spyTestExecutor = jest.spyOn(testContext, 'testExecutor');
    testListener = jest.fn();
    secondTestListener = jest.fn();
  });

  beforeEach(() => {
    spyTestExecutor.mockClear();
    testListener.mockClear();
    secondTestListener.mockClear();
    spyExecutorCalls = 0;
    testListenerCalls = 0;
    secondTestListenerCalls = 0;
  });

  describe('Добавление слушателя к функции', () => {
    test('изначально вызывается только функция', () => {
      testContext.testExecutor();
      spyExecutorCalls += 1;
      expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
      expect(testListener).not.toBeCalled();
      expect(secondTestListener).not.toBeCalled();
    });

    test('добавление первого слушателя', () => {
      testContext.observers.testExecutor.addListener(testListener);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
      testListenerCalls += 1;
      expect(testListener).toBeCalledTimes(testListenerCalls);
      expect(secondTestListener).not.toBeCalled();
    });

    test('добавление второго слушателя', () => {
      testContext.observers.testExecutor.addListener(secondTestListener);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      testListenerCalls += 1;
      secondTestListenerCalls += 1;
      expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
      expect(testListener).toBeCalledTimes(testListenerCalls);
      expect(secondTestListener).toBeCalledTimes(secondTestListenerCalls);
    });
  });

  describe('Удаление слушателя к функции', () => {
    test('передана функция, которой нет в списке (не должно ничего удалиться)', () => {
      testContext.observers.testExecutor.removeListener((): void => undefined);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      testListenerCalls += 1;
      secondTestListenerCalls += 1;
      testCalls();
    });

    test('удаление первого слушателя', () => {
      testContext.observers.testExecutor.removeListener(testListener);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      secondTestListenerCalls += 1;
      testCalls();
    });

    test('удаление второго', () => {
      testContext.observers.testExecutor.removeListener(secondTestListener);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
      expect(testListener).toBeCalledTimes(testListenerCalls);
      expect(secondTestListener).toBeCalledTimes(secondTestListenerCalls);
    });
  });
});
