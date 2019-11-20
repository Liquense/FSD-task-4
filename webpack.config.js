const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const mainPages = ['index'].map(name => {
	return new HtmlWebpackPlugin({
		template: `./src/${name}.html`,
		filename: `${name}.html`,
		chunks: [`${name}`, 'commons', 'vendors'],
	})
});

module.exports = {
	node: {
		fs: "empty"
	},

	devtool: "inline-source-map",

	entry: {
		index: './src/index.ts'
	},

	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist'),
	},

	resolve: {
		extensions: ['.ts', '.js', '.json']
	},

	plugins: [
		new CleanWebpackPlugin(),
		//new BundleAnalyzerPlugin(),
	].concat(mainPages),

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
					priority: 1
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
