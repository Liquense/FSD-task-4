jest.mock("./controller");
import * as $ from 'jquery';
import "./liquidSlider"
import Controller from "./controller/controller";

let $testDiv = $(document.body.appendChild(document.createElement("div")));

test("Инициализация слайдера", () => {
    let testParameters = {something: "", anotherArg: "test1", withMarkup: ""};

    $testDiv.liquidSlider();
    expect(Controller).toBeCalledWith($testDiv.get()[0], undefined);

    $testDiv.liquidSlider(testParameters);
    expect(Controller).toBeCalledWith($testDiv.get()[0], testParameters);
});
