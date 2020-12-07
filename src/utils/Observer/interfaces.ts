import { Observer } from './Observer';

interface Observable {
  observers: { [key: string]: Observer };
}

export { Observable };
