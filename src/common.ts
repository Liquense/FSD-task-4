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

export function addListener(executor: string, listener: Function, context: Listenable) {
    if (!context)
        return;
    if (!context.listenDictionary)
        context.listenDictionary = {};
    if (!context.listenDictionary[executor]) {
        context.listenDictionary[executor] = {function: context[executor], listeners: []};
    }

    let listeners = context.listenDictionary[executor].listeners;
    listeners.push(listener);

    bindListeners(executor, listeners, context);
}

export function removeListener(executor: string, listener: Function, context: Listenable) {
    if (!context || !context.listenDictionary || !context.listenDictionary[executor])
        return;

    let listeners = context.listenDictionary[executor].listeners;
    const listenerIndex = listeners.findIndex((value) => {
        if ("" + listener === "" + value)
            return true;
    });
    if (listenerIndex === -1)
        return;

    listeners.splice(listenerIndex, 1);
}

function bindListeners(executor: string, listeners: Function[], context: Listenable) {
    const pureFunction = context.listenDictionary[executor].function;
    context[executor] = function (...args) {
        //создаётся промис из чистой функции
        let result = new Promise((resolve) => {
            context ? pureFunction.call(context, ...args) : pureFunction(...args);
            resolve(this);
        });

        //добавляется выполнение всех слушателей после исполнения функции
        for (let listener of listeners) {
            result.then(() => {
                listener();
            });
        }
    };
}
