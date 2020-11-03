type KeyStringObj = { [key: string]: any };

type Presentable = { toString(): string } | string;

type Newable<T> = { new (...args: any[]): T };

export {
  Presentable, KeyStringObj, Newable,
};
