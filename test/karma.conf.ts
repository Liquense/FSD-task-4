const webpackConfig = require("../webpack.config");

module.exports = (config) => {
	config.set({
		files: [
			"../src/**/*.test.ts",
			"../src/**/*.ts",
		],
		exclude: ["../node_modules/"],
		frameworks: ["mocha"],

		client: {
			mocha: {opts: "mocha.opts"},
		},

		preprocessors: {
			"../src/**/*.test.ts": ["webpack", "sourcemap"],
			"../src/**/!(*.test).ts": ["webpack", "coverage"],
		},
		webpack: webpackConfig,
		webpackMiddleware: {
			stats: "errors-only",
		},

		reporters: ["mocha", "coverage"],
		coverageReporter: {
			dir: "coverage/",
			type: "html",
			instrumenterOptions: {
				istanbul: {noCompact: true}
			},
		},
		mochaReporter: {
			output: "autoWatch",
		},

		colors: true,
		autoWatch: true,
		singleRun: true,
		browsers: ["Chrome"],
	});
};
