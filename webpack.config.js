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

	entry: {
		index: './src/index.ts'
	},

	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist'),
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
				test: /\.html$/,
				loader: "html-loader",
			},
			{
				test: /\.ts$/,
				loader: "ts-loader",
			}
		]
	}
};
