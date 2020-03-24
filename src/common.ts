export const defaultSliderClass = "liquidSlider";

export function parseClassesString(classesString: string): string[] {
    if (!classesString?.trim())
        return undefined;

    return classesString.split(" ").filter((value) => {
        if (value.length > 0)
            return value;
    });
}

export interface Listenable {
    listenDictionary: object;
}

export function addListenerAfter(executorName: string, listener: Function, executorContext: Listenable) {
    if (!executorContext)
        return;
    if (!executorContext.listenDictionary)
        executorContext.listenDictionary = {};
    if (!executorContext.listenDictionary[executorName]) {
        executorContext.listenDictionary[executorName] = {function: executorContext[executorName], listeners: []};
    }

    let {listeners} = executorContext.listenDictionary[executorName];
    listeners.push(listener);

    bindListeners(executorName, listeners, executorContext);
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

export function clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
}

export function standardize(value: number, parameters: { min: number, max: number, step: number }): number {
    let min = Math.min(parameters.max, parameters.min);
    let max = Math.max(parameters.max, parameters.min); //на всякий случай

    if (value > max) {
        return max;
    }
    if (value < min) {
        return min;
    }

    let resultValue: number;
    let remainder = (value - min) % parameters.step;

    if (remainder === 0) {
        return value;
    }
    if (parameters.step / 2 > remainder) {
        resultValue = value - remainder; //ближе к нижней части шага
    } else {
        resultValue = value + (parameters.step - remainder); //ближе к верхней части
    }

    resultValue = clamp(resultValue, min, max);
    return Math.round((resultValue + Number.EPSILON) * 10000) / 10000;
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
