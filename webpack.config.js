const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

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
		extensions: ['.ts', '.js', '.json']
	},

	plugins: [
		new CleanWebpackPlugin(),
		//new BundleAnalyzerPlugin(),
		new HtmlWebpackPlugin({
			template: `./src/demoPage/index.html`,
			filename: `index.html`,
			chunks: [`index`, 'commons', 'vendors'],
		})
	],

	optimization: {
		splitChunks: {
			name: false,
			cacheGroups: {
				common: {
					name: 'commons',
					chunks: 'all',
					priority: 0
				},
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
					priority: 1,
				}
			}
		}
	},

	module: {
		rules: [
			{
				enforce: "pre",
				test: /\.js$/,
				loader: "source-map-loader"
			},
			{
				test: /\.html$/,
				loader: "html-loader",
			},
			{
				test: /\.ts(x?)$/,
				exclude: /node_modules/,
				loader: "ts-loader",
			}
		]
	}
};
