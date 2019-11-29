import Handler from "./__handler/handler";

export default class Slider {
    /**
     * коллекция данных для инициализации хэндлеров
     */
    private _handlers: Handler[];

    /**
     * вертикальный ли слайдер (чтобы установить позицию тултипов, если она не указана)
     */
    private _isVertical: boolean;

    /**
     * если не передана коллекция хэндлеров, то дефолтное их количество определяется данным параметром
     */
    private _isRange: boolean;

    /**
     * Количество элементов, перебираемых слайдером
     */
    private _itemsCount: number;
    set itemsCount(value: number) {
        this._itemsCount = value;
    };

    /**
     * HTML-код слайдера со внутренностями
     */
    private _bodyHTML: string;
    get bodyHTML() {
        return this._bodyHTML;
    };

    constructor(parameters: {
                    handlers: Handler[],
                    isVertical?: boolean,
                    isRange?: boolean,
                }
    ) {
        this.CreateHandlers();
        this.SetBodyHTML();
    }

    /**
     * Генерирует HTML-код слайдера в зависимости от содержимого (количество и вид хэндлеров, вид тултипа)
     * @constructor
     */
    private SetBodyHTML() {
        let allHandlersHTML = "";
        this._handlers.forEach((value => {
            allHandlersHTML += "\n" + value.bodyHTML;
        }));

        let result =
            "<div class=\"liquidSlider\">\n" +
            "    <p class=\"liquidSlider__data\">Отформатированные значения слайдера</p>\n" +
            "    <div class=\"liquidSlider__body\">\n" +
            "        <div class=\"liquidSlider__scale\" style=\"width: 0; height: 0;\"></div>\n" +
            allHandlersHTML +
            "        </div>\n" +
            "    </div>\n" +
            "</div>";

        this._bodyHTML = result;
    };

    /**
     * Создает хэндлеры для слайдера
     */
    private CreateHandlers() {
        if (this._isRange)
            this._handlers = [new Handler("50"),];
        else {
            let startHandler = new Handler("10");
            let endHandler = new Handler("90");
            endHandler.BindWithHandler(startHandler);
            this._handlers = [startHandler, endHandler];
        }
    };
}
