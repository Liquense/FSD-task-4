import {assert} from "chai"
import {pow} from "./index"

describe("pow", function() {
	it("возводит в степень n", function() {
		assert.equal(pow(2, 3), 8);
	});
});
