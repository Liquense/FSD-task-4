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
