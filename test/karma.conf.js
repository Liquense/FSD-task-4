const webpackConfig = require("../webpack.config");

module.exports = function(config) {
	config.set({
		frameworks: ['mocha'],
		client: {
			mocha: {opts: "mocha.opts"},
		},

		files: ['../src/*.test.ts'],
		exclude: ["../node_modules/"],

		preprocessors: {
			"../src/*.test.ts": ["webpack"],
		},
		webpack: {
			module: webpackConfig.module,
			mode: "development",
			devtool: "inline-source-map",
		},

		colors: true,
		autoWatch: true,
		//browsers: ["Chrome"],
		//singleRun: true,
	});
};
