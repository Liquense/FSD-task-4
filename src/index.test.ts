// @ts-ignore
import {assert, expect} from "chai"
// @ts-ignore
import {pow} from "./index.ts"

describe("pow", function() {
	it("При нулевой степени будет 1", function () {
		expect(pow(2, 0)).to.equal(1);
		assert.equal(pow(1, 0), 1);
	});
	it("возводит в степень n", function() {
		assert.equal(pow(2, 3), 8);
		assert.equal(pow(2, 2), 4);
	});
});
