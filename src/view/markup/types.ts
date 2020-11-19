import { SliderViewData } from '../types';

type MarkupParams = SliderViewData & { shrinkRatio: number; scaleLength: number };

type MarkParams = MarkupParams & { relativePosition: number };

export { MarkParams, MarkupParams };
