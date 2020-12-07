class Observer {
  private listeners: Function[] = [];

  constructor(listener?: Function) {
    if (listener) {
      this.addListener(listener);
    }
  }

  public addListener(listener: Function): void {
    this.listeners.push(listener);
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

export { Observer };
