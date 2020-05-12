import { ResizeObserver } from 'resize-observer';

import {
  addListenerAfter,
  clamp,
  DEFAULT_SLIDER_CLASS,
  Listenable,
  roundToDecimal,
  standardize,
} from '../../utils/common';
import { KeyStringObj, Presentable } from '../../utils/types';
import HandlerView from './handler/handlerView';
import RangeView from './range/rangeView';
import MarkupView from './markup/markupView';
import {
  HandlersOwner,
  Orientable, ScaleOwner, SliderContainer, View,
} from '../../utils/interfaces';

export default class SliderView implements Listenable, Orientable, SliderContainer, ScaleOwner,
  HandlersOwner {
    private static _DEFAULT_CLASS = 'liquidSlider';

    listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };

    public isVertical: boolean;

    public isReversed = false;

    private _elements: {
        [key: string]: HTMLElement;
        wrap: HTMLElement;
        body: HTMLElement;
        scale: HTMLElement;
        handlers: HTMLElement;
        min: HTMLElement;
        max: HTMLElement;
    };

    private _rangePairStartKey = 'start';

    private _rangePairEndKey = 'end';

    private _activeHandler: HandlerView;

    private _tooltipsAlwaysVisible: boolean;

    private _withMarkup: boolean;

    private _markup: MarkupView;

    private _step = 0.01; // относительное значение

    private _min: number; // индексы первого и последнего значений

    private _max: number;

    private _ranges: RangeView[] = [];

    private _boundHandleWindowMouseOut = this._handleWindowMouseOut.bind(this);

    // хранится для корректного удаления слушателя
    private _handleMouseMoveBound = this._handleMouseMove.bind(this);

    private _resizeObserver: ResizeObserver;

    constructor(
        private _parentView: View,
        parameters?: {
            isVertical?: boolean;
            showTooltips?: boolean;
            isReversed?: boolean;
            isRange?: boolean;
            withMarkup?: boolean;
        },
    ) {
      if (parameters?.isVertical !== undefined) {
        this.isVertical = parameters.isVertical;
      }
      if (parameters?.isReversed !== undefined) {
        this.isReversed = parameters.isReversed;
      }
      if (parameters?.showTooltips !== undefined) {
        this.setTooltipsVisibility(parameters.showTooltips);
      }
      if (parameters?.withMarkup !== undefined) {
        this._withMarkup = parameters.withMarkup;
      }

      this._createElements();
      this._setMouseEvents();
      this._setResizeObserver();
    }

    get bodyElement(): HTMLElement {
      return this._elements.body;
    }

    get handlersContainer(): HTMLElement {
      return this._elements.handlers;
    }

    get scaleStart(): number {
      return this.isVertical
        ? this._elements.scale.getBoundingClientRect().top
        : this._elements.scale.getBoundingClientRect().left;
    }

    get scaleEnd(): number {
      return this.isVertical
        ? this._elements.scale.getBoundingClientRect().bottom
        : this._elements.scale.getBoundingClientRect().right;
    }

    get scaleBorderWidth(): number {
      return Number.parseFloat(
        getComputedStyle(this._elements.scale).getPropertyValue(`border-${this.offsetDirection}-width`),
      );
    }

    public handlerSize = 0;

    get shrinkRatio(): number {
      return this.getWorkZoneLength() / this.getScaleLength();
    }

    public handlers: HandlerView[] = [];

    get offsetDirection(): string {
      if (this.isVertical) {
        return 'top';
      }
      return 'left';
    }

    get expandDimension(): string {
      if (this.isVertical) {
        return 'height';
      }
      return 'width';
    }

    public getScaleLength(): number {
      return Number.parseFloat(
        (this._elements.scale.getBoundingClientRect() as KeyStringObj)[this.expandDimension],
      );
    }

    public setOrientation(newState: boolean): void {
      const operableObjects: KeyStringObj[] = [this._elements];

      if (this._markup?.wrap) {
        operableObjects.push({ wrap: this._markup.wrap });
      }

      this.handlers.forEach((handler) => {
        operableObjects.push(handler.element);
        operableObjects.push(handler.tooltip.element);
      });

      this._ranges.forEach((range) => {
        operableObjects.push(range);
      });

      const oldOrientClass = this.getOrientationClass();
      this.isVertical = newState;
      const newOrientClass = this.getOrientationClass();

      operableObjects.forEach((obj) => {
        Object.keys(obj).forEach((key) => {
          if (obj[key]?.classList) {
            obj[key].classList.remove(oldOrientClass);
            obj[key].classList.add(newOrientClass);
          }
        });
      });
    }

    public setTooltipsVisibility(stateToSet?: boolean): void {
      const stateToPass = (stateToSet === undefined) || (stateToSet === null)
        ? (this._tooltipsAlwaysVisible) : (stateToSet);

      this._tooltipsAlwaysVisible = stateToPass;
      this.handlers.forEach((handler) => {
        handler.setTooltipVisibility(stateToPass);
      });
    }

    public getOrientationClass(): string {
      return this.isVertical ? `${DEFAULT_SLIDER_CLASS}_vertical` : `${SliderView._DEFAULT_CLASS}_horizontal`;
    }

    // возвращает позицию мыши относительно начала шкалы в стндартизированном виде
    public calculateMouseRelativePos(mouseEvent: MouseEvent): number {
      const mouseCoordinate = this.isVertical ? mouseEvent.clientY : mouseEvent.clientX;
      const initialOffset = this.handlerSize / 2;
      const scaledCoordinate = (mouseCoordinate - this.scaleStart - initialOffset)
            / this.shrinkRatio;

      return clamp((scaledCoordinate) / this.getScaleLength(), 0, 1);
    }

    public clearRanges(): void {
      this._ranges.forEach((range) => {
        range.remove();
      });
      this._ranges = [];
    }

    public createRanges(): void {
      this.clearRanges();

      this.handlers.forEach((handler) => {
        const newRange = this._createRange(handler);
        if (newRange) {
          this._ranges.push(newRange);
        }
      });
    }

    public initHandlers(
      handlersData: {
            customHandlers: boolean;
            handlersArray: {
                handlerIndex: number;
                positionPart: number;
                item: Presentable;
                withTooltip?: boolean;
                rangePair?: string;
            }[];
        },
    ): void {
      this._clearHandlers();

      this.handlers = handlersData.handlersArray.map((handler, index, handlers) => {
        const newHandler = new HandlerView(this, {
          ...handler,
          withTooltip: this._tooltipsAlwaysVisible,
        });

        // если хэндлеры дефолтные, то им присваиваются подходящие пары
        if (!handlersData.customHandlers) {
          if (handlers.length === 2) {
            if (index === 0) {
              newHandler.rangePair = this.isReversed ? this._rangePairStartKey : 1;
            }
            if (index === 1) {
              newHandler.rangePair = this.isReversed ? this._rangePairEndKey : 0;
            }
          } else {
            newHandler.rangePair = this.isReversed
              ? this._rangePairEndKey : this._rangePairStartKey;
          }
        }

        return newHandler;
      });

      this._setHandlerSize();
      this._initMarkup();
      this.createRanges();
    }

    public addHandler(
      handlerParams: {
            positionPart: number;
            item: Presentable;
            handlerIndex: number;
            rangePair: number | string;
        },
    ): void {
      if (!handlerParams) return;

      const newHandler = new HandlerView(
        this,
        {
          handlerIndex: handlerParams.handlerIndex,
          item: handlerParams.item,
          positionPart: handlerParams.positionPart,
          rangePair: handlerParams.rangePair,
          withTooltip: this._tooltipsAlwaysVisible,
        },
      );

      this.handlers.push(newHandler);
      const newRange = this._createRange(newHandler);
      if (newRange) {
        this._ranges.push(newRange);
      }
    }

    public removeHandler(handlerIndex: number): void {
      const handlerToRemoveIndex = this.handlers.findIndex(
        (handler) => handler.index === handlerIndex,
      );
      const handlerToRemove = this.handlers[handlerToRemoveIndex];

      const rangesToRemove = this._ranges.filter((range) => range.hasHandler(handlerToRemove));

      rangesToRemove.forEach((range) => {
        const rangeIndex = this._ranges.indexOf(range);
        range.remove();
        this._ranges.splice(rangeIndex, 1);
      });

      handlerToRemove.remove();
      this.handlers.splice(handlerToRemoveIndex, 1);
    }

    public getWorkZoneLength(): number {
      const { handlerSize } = this;
      const scaleSize = this.getScaleLength();
      return scaleSize - handlerSize;
    }

    public calculateHandlerOffset(relativePosition: number): number {
      return this.getWorkZoneLength() * relativePosition;
    }

    public calcRelativeHandlerSize(): number {
      return this.handlerSize / this.getWorkZoneLength();
    }

    public setHandlersData(
      handlers: { index: number; item: Presentable; relativeValue: number }[],
    ): void {
      if (handlers.some((handler) => handler === null)) return;

      handlers.forEach(({ index, item, relativeValue }) => {
        const realIndex = this.handlers.findIndex(
          (handler) => handler.index === index,
        );
        if (realIndex === -1) {
          return;
        }

        this.handlers[realIndex].setValue(item);
        this.handlers[realIndex].setPosition(relativeValue);
      });
    }

    // обновление информации для отображения (для изменений после создания)
    public update(
      data?:
            {
                min?: number; max?: number; step?: number;
                isVertical?: boolean; tooltipsVisible?: boolean; withMarkup?: boolean;
            },
    ): void {
      if (Number.isFinite(data?.step)) {
        this._step = data.step;
      }
      if (Number.isFinite(data?.min)) {
        this._min = data.min;
      }
      if (Number.isFinite(data?.max)) {
        this._max = data.max;
      }
      if (data?.tooltipsVisible !== undefined) {
        this.setTooltipsVisibility(data.tooltipsVisible);
      }
      if (data?.isVertical !== undefined) {
        this.setOrientation(data.isVertical);
      }
      if (data?.withMarkup !== undefined) {
        this._withMarkup = data.withMarkup;
      }

      this._refreshElements();
    }

    public addOnMouseDownListener(listener: Function): void {
      this._elements.body.removeEventListener('mousedown', this._handleMouseDown);

      addListenerAfter(this._handleMouseDown.name, listener, this);

      this._elements.body.addEventListener('mousedown', this._handleMouseDown);
    }

    private _setHandlerSize(): void {
      const exemplarHandler = this.handlers[0];
      this.handlerSize = exemplarHandler.size;
    }

    private static _preventDefault = (event: Event): void => event.preventDefault();

    private _createElements(): void {
      const parentElement = this._parentView.body;
      this._elements = {
        wrap: document.createElement('div'),
        body: document.createElement('div'),
        scale: document.createElement('div'),
        handlers: document.createElement('div'),
        min: document.createElement('span'),
        max: document.createElement('span'),
      };

      const { wrap } = this._elements;
      wrap.classList.add(DEFAULT_SLIDER_CLASS);
      parentElement.replaceWith(wrap);

      Object.keys(this._elements).forEach((elementName) => {
        const element = this._elements[elementName];
        element.classList.add(`${DEFAULT_SLIDER_CLASS}__${elementName}`);
        switch (elementName) {
          case 'wrap':
            break;
          case 'body':
            // чтобы не возникало drag-n-drop (с ondragstart не работает)
            element.addEventListener('mousedown', SliderView._preventDefault);
            wrap.append(element);
            break;
          case 'min':
          case 'max':
            wrap.append(element);
            break;
          default:
            this._elements.body.append(element);
            break;
        }
      });

      this.setOrientation(this.isVertical);
    }

    private _setMouseEvents(): void {
      document.body.addEventListener(
        'mousedown',
        this._handleDocumentMouseDown.bind(this),
      );
      this._elements.body.addEventListener(
        'mousedown',
        this._handleMouseDown.bind(this),
      );
      document.body.addEventListener(
        'mouseup',
        this._handleMouseUp.bind(this),
      );
    }

    private _setResizeObserver(): void {
      this._resizeObserver = new ResizeObserver(this._refreshElements.bind(this));
      this._resizeObserver.observe(this._elements.body);
    }

    private _handleWindowMouseOut(event: MouseEvent): void {
      const from = event.target as HTMLElement;
      if (from.nodeName === 'HTML') {
        document.body.removeEventListener('mousemove', this._handleMouseMoveBound);
      }
    }

    private _handleDocumentMouseDown(event: MouseEvent): void {
      const target = (event.target) as HTMLElement;
      if (!this._elements.wrap.contains(target)) {
        this._deactivateActiveHandler();
      }
    }

    private _handleMouseUp(): void {
      document.body.removeEventListener('mousemove', this._handleMouseMoveBound);
      document.body.removeEventListener('mouseout', this._handleWindowMouseOut);
    }

    private _handleMouseDown(event: MouseEvent): MouseEvent {
      const closestHandler = this._getClosestToMouseHandler(event.clientX, event.clientY);

      if (!closestHandler) {
        return event;
      }

      this._activateHandler(closestHandler);
      this._activeHandler.body.focus();

      this._handleMouseMove(event);
      document.body.addEventListener('mousemove', this._handleMouseMoveBound);

      // проверка на выход за пределы окна браузера
      window.addEventListener('mouseout', this._boundHandleWindowMouseOut);

      return event; // для обработки события пользовательскими функциями
    }

    private _handleMouseMove(event: MouseEvent): void {
      const closestHandler = this._getClosestToMouseHandler(event.clientX, event.clientY);

      if (closestHandler !== this._activeHandler) {
        return;
      }

      this._activateHandler(closestHandler);

      const mousePosition = this.calculateMouseRelativePos(event);
      let standardMousePosition: number;

      const stepsRemainder = 1 % this._step;
      const penultimatePosition = 1 - stepsRemainder;
      if (mousePosition > penultimatePosition && stepsRemainder !== 0) {
        standardMousePosition = standardize(mousePosition, {
          min: penultimatePosition,
          max: 1,
          step: stepsRemainder,
        });
      } else {
        standardMousePosition = standardize(mousePosition, {
          min: 0,
          max: penultimatePosition,
          step: this._step,
        });
      }

      // в standardize результат округляется до 4-х знаков после запятой
      if (standardMousePosition === roundToDecimal(closestHandler.positionPart, 4)) {
        return;
      }

      this._parentView.handlerPositionChanged(closestHandler.index, standardMousePosition);
    }

    private _deactivateActiveHandler(): void {
      this._activateHandler(null);
    }

    private _activateHandler(handlerToActivate: HandlerView): void {
      // убираем отображение тултипа с предыдущего
      if (this._activeHandler) {
        this._activeHandler.setTooltipVisibility(this._tooltipsAlwaysVisible);
      }

      this._activeHandler = handlerToActivate;

      if (handlerToActivate) {
        handlerToActivate.setTooltipVisibility(true);
      }
    }

    private _getClosestToMouseHandler(mouseX: number, mouseY: number): HandlerView {
      return this.isVertical ? this._findClosestHandler(mouseY) : this._findClosestHandler(mouseX);
    }

    private _findClosestHandler(mouseCoordinate: number): HandlerView {
      let minDistance = Number.MAX_VALUE;
      let closestHandler: HandlerView = null;

      this.handlers.forEach((handler) => {
        const distance = Math.abs(handler.positionCoordinate - mouseCoordinate);

        if (minDistance > distance) {
          closestHandler = handler;
          minDistance = distance;
        }
      });

      return closestHandler;
    }

    private _findSuitableHandler(firstHandler: HandlerView): HandlerView {
      return this.handlers.find((handler) => handler.index === firstHandler.rangePair);
    }

    private _createRange(handler: HandlerView): RangeView {
      if (handler.rangePair === null) {
        return null;
      }

      const secondHandler = this._findSuitableHandler(handler);

      // если хэндлера с нужным индексом не находится и пара не нужна
      if (!secondHandler) {
        if ((handler.rangePair !== this._rangePairStartKey)
                && (handler.rangePair !== this._rangePairEndKey)) return null;
      }

      return new RangeView(this, this._elements.scale, handler, secondHandler);
    }

    private _initMarkup():
        void {
      this._markup = new MarkupView(this);
      this._updateMarkup();
    }

    private _updateMarkup(): void {
      if (!this._markup) { return; }

      this._markup.clearAllMarks();

      if (!this._withMarkup) { return; }

      requestAnimationFrame(() => {
        // i округляется, чтобы не всплывало ошибок деления
        for (let i = 0; i <= 1; i = roundToDecimal(i + this._step, 5)) {
          const standardPosition = standardize(i, { min: 0, max: 1, step: this._step });
          const shrinkPosition = standardPosition * this.shrinkRatio;
          this._markup.addMark(shrinkPosition, this.calcRelativeHandlerSize());
        }
      });
    }

    private _clearHandlers(): void {
      this.clearRanges();
      this._elements.handlers.innerHTML = '';
      this.handlers = [];
    }

    private _refreshElements(): void {
      this._updateMarkup();

      this._ranges.forEach((range) => {
        range.refreshPosition();
      });

      this.handlers.forEach((handler) => {
        handler.refreshPosition();
      });

      this._elements.min.innerText = this._min?.toFixed(2);
      this._elements.max.innerText = this._max?.toFixed(2);
    }
}
