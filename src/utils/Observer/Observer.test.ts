import { Observable, Observer } from './Observer';

describe('Слушатель', () => {
  class TestContext implements Observable {
    public observers: { [key: string]: Observer } = {};

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

    test('добавление без передачи контекста (ничего не должно добавиться)', () => {
      Observer.addListener('testExecutor', null, testListener);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
      expect(testListener).not.toBeCalled();
      expect(secondTestListener).not.toBeCalled();
    });

    test('добавление первого слушателя', () => {
      Observer.addListener('testExecutor', testContext, testListener);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
      testListenerCalls += 1;
      expect(testListener).toBeCalledTimes(testListenerCalls);
      expect(secondTestListener).not.toBeCalled();
    });

    test('добавление второго слушателя', () => {
      Observer.addListener('testExecutor', testContext, secondTestListener);
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
    test('без передачи контекста (не должно ничего удалиться)', () => {
      Observer.removeListener('testExecutor', null, testListener);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      testListenerCalls += 1;
      secondTestListenerCalls += 1;
      testCalls();
    });

    test('передана функция, которой нет в списке (не должно ничего удалиться)', () => {
      Observer.removeListener('testExecutor', testContext, (): void => undefined);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      testListenerCalls += 1;
      secondTestListenerCalls += 1;
      testCalls();
    });

    test('удаление первого слушателя', () => {
      Observer.removeListener('testExecutor', testContext, testListener);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      secondTestListenerCalls += 1;
      testCalls();
    });

    test('удаление второго', () => {
      Observer.removeListener('testExecutor', testContext, secondTestListener);
      testContext.testExecutor();
      spyExecutorCalls += 1;
      expect(spyTestExecutor).toBeCalledTimes(spyExecutorCalls);
      expect(testListener).toBeCalledTimes(testListenerCalls);
      expect(secondTestListener).toBeCalledTimes(secondTestListenerCalls);
    });
  });
});
