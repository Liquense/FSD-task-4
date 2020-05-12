import { Presentable } from './types';

export interface View {
    body: HTMLElement;

    passVisualProps(
        parameters?: { isVertical?: boolean; tooltipsVisible?: boolean; withMarkup?: boolean }
    ): void;

    passDataProps(
        sliderData: { step?: number; absoluteStep: number; min: number; max: number }
    ): void;

    /**
     * Функция, которую слушает контроллер для отслеживания изменений со стороны Видов
     */
    handlerPositionChanged(
        handlerIndex: number,
        standardizedPosition: number,
    ): { view: View; index: number; position: number };

    handlersValuesChangedListener(
        data: { index: number; relativeValue: number; item: Presentable }
    ): void;

    initHandlers(handlersData: {
        customHandlers: boolean;
        handlersArray: {
            handlerIndex: number;
            positionPart: number;
            item: Presentable;
            itemIndex: number;
        }[];
    }): void;

    addHandler
    (handlerParams: { positionPart: number; item: Presentable; handlerIndex: number }): void;

    removeHandler(handlerIndex: number): void;
}

export interface Orientable {
  expandDimension: string;
  offsetDirection: string;
  isVertical: boolean;

  getOrientationClass(): string;
}

export interface SliderContainer {
  handlersContainer: HTMLElement;
  bodyElement: HTMLElement;
}

export interface ScaleOwner {
  scaleStart: number;
  scaleEnd: number;
  scaleBorderWidth: number;
  shrinkRatio: number;

  getScaleLength(): number;
}

export interface HandlersOwner {
  calculateHandlerOffset(relativePosition: number): number;
}

export interface SliderElement {
  ownerSlider: Orientable & SliderContainer & ScaleOwner & HandlersOwner;
}

export interface Listenable {
  listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };
}
