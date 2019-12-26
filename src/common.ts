import Func = Mocha.Func;

export const defaultSliderClass = "liquidSlider";
export const viewFunctionNames = [
    "viewTest", //
];
export const modelFunctionNames = [
    "modelTest",
];

export function parseClassesString(classesString: string): string[] {
    if (!classesString)
        return undefined;

    return classesString.split(" ");
}

export function addClasses(element: Element, classes: string[]) {
    if (!classes)
        return;

    for (const className of classes) {
        addClass(element, className);
    }
}

export function addClass(element: Element, className: string) {
    element.classList.add(className.trim());
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
        pureFunc.call(executorContext, ...args);

        //добавляется выполнение всех слушателей после исполнения функции
        for (let listener of listeners) {
            listener(executorContext);
        }
    };
}

export function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
}

export function getElementCenter(element: Element): {x: number, y: number} {
    let result = {x: undefined, y: undefined};

    const elementCoordinates = element.getBoundingClientRect();
    result.x = 2;
    result.y = 3;

    return result;
}
