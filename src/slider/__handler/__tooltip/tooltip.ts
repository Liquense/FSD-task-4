import {defaultSliderClass} from "../../../common";

export default class Tooltip {
    public value: string;
    public bodyHTML = "<div class=\"liquidSlider__handlerData\"></div>\n";
    public additionalClass: string;
    private readonly _defaultClass = defaultSliderClass + "__tooltip ";
    private _currentPosition: string;

    constructor(sliderIsVertical: boolean, additionalClass?: string, position?: string, bodyHTML?: string) {
        let defaultParameters = this.InitDefaultParameters(sliderIsVertical);
        let parameters = {...defaultParameters, ...arguments};

        this.additionalClass = parameters.additionalClass;
        this._currentPosition = parameters.position;
        this.bodyHTML = parameters.bodyHTML;
    }

    private InitDefaultParameters(sliderIsVertical: boolean) {
        let defaultParameters = {
            additionalClass: "",
            bodyHTML: this.bodyHTML,
            withTooltip: true,
            isEnd: true,
            position: undefined,
        };

        if (sliderIsVertical) {
            defaultParameters.position = "left";
        } else {
            defaultParameters.position = "up";
        }

        return defaultParameters;
    }
}
