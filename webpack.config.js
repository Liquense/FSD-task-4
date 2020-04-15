const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	node: {
		fs: "empty"
	},

	devtool: "inline-source-map",

	entry: {
		index: './src/demoPage/index.ts'
	},

	output: {
		filename: 'main.js',
		chunkFilename: "[name].bundle.js",
		path: path.resolve(__dirname, 'dist'),
	},

	resolve: {
		extensions: ['.ts', '.js']
	},

	plugins: [
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.$": "jquery",
			"window.jQuery": "jquery",
		}),
		new CleanWebpackPlugin(),
		//new BundleAnalyzerPlugin(),
		new HtmlWebpackPlugin({
			template: `./src/demoPage/index.html`,
			filename: `index.html`,
			chunks: [`index`, 'commons', 'vendors'],
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[id].css',
			ignoreOrder: false,
		}),
	],

	optimization: {
		splitChunks: {
			name: false,
			cacheGroups: {
				common: {
					name: 'commons',
					priority: 0
				},
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
				test: /\.ts(x?)$/,
				exclude: [/node_modules/, /(\.(test)?)\.ts(x?)/],
				loader: "ts-loader",
			},
			{
				test: /\.scss$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
			},
		]
	}
};
