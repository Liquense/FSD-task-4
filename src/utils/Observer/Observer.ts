interface Observable {
  observers: { [key: string]: Observer };
}

class Observer {
  private listeners: Function[] = [];

  constructor(listener?: Function) {
    if (listener) {
      this.addListener(listener);
    }
  }

  public static addListener(executor: string, context: Observable, listener?: Function): void {
    let observer: Observer;
    if (!context) {
      return;
    }

    if (!context.observers) {
      context.observers = {};
    }

    if (!context.observers[executor]) {
      observer = new Observer();
      context.observers[executor] = observer;
    } else {
      observer = context.observers[executor];
    }

    observer.addListener(listener);
  }

  public addListener(listener: Function): void {
    this.listeners.push(listener);
  }

  public static removeListener(executor: string, context: Observable, listener: Function): void {
    if (!context?.observers?.[executor]) {
      return;
    }

    context.observers[executor].removeListener(listener);
  }

  public removeListener(listener: Function): void {
    const removeIndex = this.listeners.findIndex(
      (currentListener) => listener === currentListener,
    );
    if (removeIndex < 0) {
      return;
    }
    this.listeners.splice(removeIndex, 1);
  }

  public callListeners(...args: any[]): void {
    this.listeners.forEach((listener) => {
      listener(...args);
    });
  }
}

export { Observable, Observer };
