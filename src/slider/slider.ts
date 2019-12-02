import Handler from "./__handler/handler";

export default class Slider {
    private _handlers: Handler[];
    private _isVertical: boolean;
    private _isRange: boolean;
    private _bodyHTML: string;
    get bodyHTML() {
        return this._bodyHTML;
    };

    constructor(parameters: {
                    isVertical?: boolean,
                    isRange?: boolean,
                    handlers?: object[],
                }
    ) {
        this.CreateDefaultHandlers();
        this.GenerateBodyHTML();
    }

    private GenerateBodyHTML() {
        let allHandlersHTML = "";
        this._handlers.forEach((value => {
            allHandlersHTML += "\n" + value.bodyHTML;
        }));

        let result =
            "<div class=\"liquidSlider\">\n" +
            "    <p class=\"liquidSlider__data\">Отформатированные значения слайдера</p>\n" +
            "    <div class=\"liquidSlider__body\">\n" +
            "        <div class=\"liquidSlider__scale\"></div>\n" +
            allHandlersHTML +
            "        </div>\n" +
            "    </div>\n" +
            "</div>";

        this._bodyHTML = result;
    };

    private CreateDefaultHandlers() {
        if (this._isRange) {
            let startHandler = new Handler({value: 10, sliderIsVertical: this._isVertical});
            let endHandler = new Handler({value: 80, sliderIsVertical: this._isVertical});
            endHandler.BindWithHandler(startHandler);
            this._handlers = [startHandler, endHandler];
        } else {
            this._handlers = [new Handler({value: 50, sliderIsVertical: this._isVertical})];
        }
    };
}
