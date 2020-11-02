const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	node: {
		fs: "empty"
	},

	devtool: "inline-source-map",

	entry: {
		'demo-page': './src/demo-page/demo-page.ts'
	},

	output: {
		filename: '[name].js',
		chunkFilename: "[name].bundle.js",
		path: path.resolve(__dirname, 'dist'),
	},

	resolve: {
		extensions: ['.ts', '.js']
	},

	plugins: [
		new CleanWebpackPlugin(),
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.$": "jquery",
			"window.jQuery": "jquery",
		}),
		new HtmlWebpackPlugin({
			template: `./src/demo-page/demo-page.pug`,
			filename: `demo-page.html`,
			chunks: [`demo-page`, 'vendors'],
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[name].css',
			ignoreOrder: false,
		}),
	],

	optimization: {
		splitChunks: {
			name: false,
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					priority: 1,
				}
			}
		}
	},

	module: {
		rules: [
			{
				test: /\.html$/,
				loader: "html-loader",
			},
			{
				test: /\.pug$/,
				loader: "pug-loader"
			},
			{
				test: /\.ts(x?)$/,
				exclude: [/node_modules/, /(\.(test)?)\.ts(x?)/],
				loader: ["ts-loader", "eslint-loader"],
			},
			{
				test: /\.scss$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
			},
		]
	}
};
