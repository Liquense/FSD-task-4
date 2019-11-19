const webpackConfig = require("../webpack.config");

module.exports = function (config) {
	config.set({
		files: ['../src/*.test.ts'],
		//exclude: ["../node_modules/"],
		frameworks: ["chai", "mocha"],
		reporters: ["mocha", "coverage"],

		client: {
			mocha: {opts: "mocha.opts"},
		},

		preprocessors: {
			"../src/*.test.ts": ["webpack", "coverage"],
		},
		webpack: {
			module: webpackConfig.module,
			mode: "development",
			devtool: "inline-source-map",
		},

		coverageReporter: {
			dir: "coverage/",
			type: "html"
		},
		mochaReporter: {
			output: "autoWatch",
		},

		colors: true,
		autoWatch: true,
		//browsers: ["Chrome"],
		singleRun: true,
	});
};
