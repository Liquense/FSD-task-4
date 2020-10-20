import { Presentable } from '../types';

type SliderModelParams = {
  isRange?: boolean;
  min?: number;
  max?: number;
  step?: number;
  items?: Array<Presentable>;
  values?: number[];
  handlers?: {
    itemIndex: number;
  }[];
};

export { SliderModelParams };
