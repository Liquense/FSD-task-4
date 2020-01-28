export const defaultSliderClass = "liquidSlider";

export function parseClassesString(classesString: string): string[] {
    if (!classesString)
        return undefined;

    return classesString.split(" ");
}

export function addClasses(element: HTMLElement, classes: string[]) {
    if (!classes)
        return;

    for (const className of classes) {
        addClass(element, className);
    }
}

export function addClass(element: HTMLElement, className: string) {
    element.classList.add(className.trim());
}

export function removeClass(element: HTMLElement, className: string) {
    element.classList.remove(className.trim());
}

export interface Listenable {
    listenDictionary: object;
}

export function addListenerAfter(executor: string, listener: Function, executorContext: Listenable) {
    if (!executorContext)
        return;
    if (!executorContext.listenDictionary)
        executorContext.listenDictionary = {};
    if (!executorContext.listenDictionary[executor]) {
        executorContext.listenDictionary[executor] = {function: executorContext[executor], listeners: []};
    }

    let {listeners} = executorContext.listenDictionary[executor];
    listeners.push(listener);

    bindListeners(executor, listeners, executorContext);
}

export function removeListener(executor: string, listener: Function, executorContext: Listenable) {
    if (!executorContext?.listenDictionary?.[executor])
        return;

    let {listeners} = executorContext.listenDictionary[executor];
    const listenerIndex = listeners.findIndex((value: Function) => listener === value);
    if (listenerIndex === -1)
        return;

    listeners.splice(listenerIndex, 1);
}

function bindListeners(executor: string, listeners: Function[], executorContext: Listenable) {
    const pureFunc = executorContext.listenDictionary[executor].function;
    executorContext[executor] = function (...args) {
        const functionResult = pureFunc.call(executorContext, ...args);

        //добавляется выполнение всех слушателей после исполнения функции
        for (let listener of listeners) {
            listener(functionResult);
        }
    };
}

export function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
}

export function getElementCenter(element: Element): { x: number, y: number } {
    let result = {x: undefined, y: undefined};

    const elementCoordinates = element.getBoundingClientRect();
    result.x = 2;
    result.y = 3;

    return result;
}

export function standardize(value: number, parameters: { min: number, max: number, step: number }): number {
    if (value > parameters.max) {
        return parameters.max;
    }
    if (value < parameters.min) {
        return parameters.min;
    }

    let resultValue: number;
    let remainder = (value - parameters.min) % parameters.step;

    if (remainder === 0) {
        return value;
    }
    if (parameters.step / 2 > remainder) {
        resultValue = value - remainder; //ближе к нижней части шага
    } else {
        resultValue = value + (parameters.step - remainder); //ближе к верхней части
    }

    return clamp(resultValue, parameters.min, parameters.max);
}

export function calculateElementCenter(DOMElement: Element, isVertical: boolean): number {
    const thisRect = DOMElement.getBoundingClientRect();
    let thisCenter: number;

    if (isVertical) {
        thisCenter = thisRect.top + thisRect.height / 2;
    } else {
        thisCenter = thisRect.left + thisRect.width / 2;
    }

    return thisCenter;
}
