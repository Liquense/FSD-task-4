import { ExpandDimension, OffsetDirection } from '../types';

type HandlerViewUpdatePositionParams = {
  workZoneLength: number;
  expandDimension: ExpandDimension;
  offsetDirection: OffsetDirection;
};

type HandlerViewSetPositionParams = { positionPart: number } & HandlerViewUpdatePositionParams;

export { HandlerViewSetPositionParams, HandlerViewUpdatePositionParams };
