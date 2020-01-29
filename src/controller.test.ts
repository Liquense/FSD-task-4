import Controller from "./controller";

test("Инициализация контроллера", () => {
    expect(new Controller()).toBe({});
});
