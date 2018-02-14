/**
* webpack 2/3 version
*
* @author: min
*/

// package.json
const packageInfo = require('./package.json');

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');// extract compiled css seperately
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ENV = process.env.NODE_ENV || 'development';

// post css related
const postImport = require('postcss-import');
const autoprefixer = require('autoprefixer'); // https://github.com/postcss/autoprefixer

// when app is served in subdomain
// const basename = '/demo/image-texture/';
const basename = '/demo/canvas-particle/';

// config
const config = {
	app: './app',
	dist: './dist',
	style: './app/style',
	image: './app/asset/image',
	font: './app/asset/font',
	DEV_WATCH: 'watch',
	DEV_ENV: 'development',
	PRODUCTION_ENV: 'production',
};

console.log('===== ENV: ', ENV, '======');

// default plugins
let WP_PLUGINS = [
	// see code spliting(https:// webpack.github.io/docs/code-splitting.html)
	// https://webpack.js.org/plugins/commons-chunk-plugin/
	new webpack.optimize.CommonsChunkPlugin({
		name: 'vendor', // create a seperate vendor file
		minChunks: Infinity,
		filename: 'script/vendor.bundle.js', // name of the file
	}),

	new HtmlWebpackPlugin({
		inject: true, // if true, it injects scrip/style tags in the index.html
		template: __dirname + '/app/template/index.hbs',// defaul index html(index.hbs)
		filename: 'index.html', // compiled name of the file
		favicon: '', // favicon location
		cache: false,
	}),

	// copy & move files to dist
	new CopyWebpackPlugin([
		{ from: __dirname + '/app/asset/image', to: __dirname + '/dist/asset/image' },
		{ from: __dirname + '/app/asset/font', to: __dirname + '/dist/asset/font' },
		{ from: __dirname + '/app/asset/json', to: __dirname + '/dist/asset/json' },
	]),

];


if (ENV === config.DEV_WATCH || ENV === config.DEV_ENV) {

	// development or watch
	WP_PLUGINS = WP_PLUGINS.concat([
		new ExtractTextPlugin({
			filename: 'style/style.css',
			allChunks: true,
			disable: true, // !must be true. enable HMR for style.
		}),
		new webpack.NamedModulesPlugin(), // HMR will log module change
	]);

} if (ENV === config.PRODUCTION_ENV) {

	// production
	WP_PLUGINS = WP_PLUGINS.concat([
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production'),
			},
		}),
		new webpack.NoErrorsPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			mange: {
				except: ['$super', '$', 'exports', 'require'],
			},
			sourcemap: false,
			compress: {
				warnings: true,
			},
		}),

		new ExtractTextPlugin({
			filename: 'style/style.css',
			allChunks: true,
		}),

		new webpack.LoaderOptionsPlugin({
			minimize: true,
			context: __dirname,
		}),

	]);

}

// style loader(context should be window)
const STYLE_LOADERS = ExtractTextPlugin.extract({
	fallback: 'style-loader',
	use: [
		{
			loader: 'css-loader',
			options: {
				/**
				 * With CSS module
				 * https:// medium.freecodecamp.org/reducing-css-bundle-size-70-by-cutting-the-class-names-and-using-scope-isolation-625440de600b
				*/
				modules: true,
				importLoaders: 2, // number of loaders before css loader(postcss, sass) 0 => no loaders (default); 1 => postcss-loader; 2 => postcss-loader, sass-loader
				localIdentName: '[name]__[local]___[hash:base64:5]',
				getLocalIdent: (context, localIdentName, localName, options) => {

					// TODO. truncate into smallest possible
					const componentName = context.resourcePath.split('/').slice(-2, -1);

					return localName;

				},
				sourceMap: ENV !== config.PRODUCTION_ENV,
			},
		},
		{
			loader: 'postcss-loader',
			options: {
				ident: 'postcss', // id. must be set for comlex option
				syntax: 'postcss-scss', // syntax & parser
				sourceMap: ENV !== config.PRODUCTION_ENV, // sourceMap, only dev
				plugins: (loader) => [
					postImport(),
					autoprefixer({
						browsers: packageInfo.browserslist, // see package.json
					}),
				],
			},
		},
		{
			loader: 'sass-loader',
			options: {
				outputStyle: ENV === config.PRODUCTION_ENV ? 'compressed' : 'nested', // Dev | watch -> nested, prod: compressed
			},
		},
	],
});


module.exports = {
	context: path.resolve(__dirname, config.app),
	entry: {
		bundle: [
			'babel-polyfill',
			'./script/main', // entry script to be part of main bundle
		],
		vendor: [
			'lodash',
			'simple-color-picker',
		],
	},

	devtool: ENV === config.DEV_ENV ? 'inline-source-map' : false,

	// see https://webpack.js.org/configuration/dev-server/
	// note. the below can be a part of CLI in package.json
	devServer: {
		historyApiFallback: true,
		contentBase: path.join(__dirname, config.app),
		open: true,
		noInfo: true,
	},

	output: {
		path: path.resolve(__dirname, config.dist),
		filename: 'script/[name].js',
		publicPath: ENV === config.PRODUCTION_ENV ? basename : '/',
	},

	module: {

		rules: [
			// webpack 2,3 doens't support preLoaders. use enforce: "pre"
			// es lint
			{
				test: /\.(js)$/,
				exclude: /node_modules/,
				enforce: 'pre',
				use: [
					{
						loader: 'eslint-loader',
						options: {
							failOnError: true,
						},
					},
				],
			},

			// js
			{
				test: /\.(js)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							cacheDirectory: true,
						},
					},
				],
			},

			// scss
			{
				test: /\.(css|scss|sass)$/,
				include: path.resolve(__dirname, config.style),
				exclude: /node_modules/,
				use: STYLE_LOADERS,
			},

			// modernizr
			{
				test: /\.modernizrrc$/,
				use: [
					{
						loader: 'modernizr-loader',
					},
				],
			},

			// html
			{
				test: /\.html$/,
				use: [
					{
						loader: 'html-loader',
					},
				],
				exclude: /node_modules/,
			},

			// image
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'asset/image/[name].[ext]',
						},
					},

					{
						loader: 'image-webpack-loader',
						options: {
							bypassOnDebug: true,
							gifsicle: {
								optimizationLevel: 7,
								interlaced: false,
							},
							optipng: {
								optimizationLevel: 7,
								interlaced: false,
							},
							pngquant: {
								quality: '65-90',
								speed: 4,
							},
							mozjpeg: {
								progressive: true,
								quality: 65,
							},
							// Specifying webp here will create a WEBP version of your JPG/PNG images
							webp: {
								quality: 75,
							},
						},
					},
				],
			},

			// hbs(template)
			{
				test: /\.(hbs|handlebars)$/,
				use: [
					{
						loader: 'handlebars-loader',
					},
				],
			},

			// font
			{
				test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						mimetype: 'application/font-woff',
						name: 'asset/font/[name].[ext]',
					},
				},
			},

			{
				test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						mimetype: 'application/font-woff',
						name: 'asset/font/[name].[ext]',
					},
				},
			},

			{
				test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						mimetype: 'application/octet-stream',
						name: 'asset/font/[name].[ext]',
					},
				},
			},

			{
				test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'file-loader',
					options: {
						name: 'asset/font/[name].[ext]',
					},
				},
			},

		],
	},

	// shortcut, so we can avoid ../../
	// https:// webpack.js.org/configuration/resolve/#resolve-alias
	resolve: {
		descriptionFiles: ['package.json'],
		modules: [
			path.resolve('./'),
			path.resolve('./node_modules'),
		],
		extensions: ['.scss', '.css', '.js', '.json'],
		alias: {
			modernizr$: path.resolve(__dirname, './.modernizrrc'), // trailing
			TemplateRoot: path.resolve(__dirname, './app/template'),
			StyleRoot: path.resolve(__dirname, './app/style'),
			ScriptRoot: path.resolve(__dirname, './app/script'),
			AssetRoot: path.resolve(__dirname, './app/asset'),

			// !this is a hack to solve velocity-react + lodash alias issue
			'lodash/object/omit': 'lodash/omit',
			'lodash/object/extend': 'lodash/extend',
			'lodash/lang/isObject': 'lodash/isObject',
			'lodash/lang/isEqual': 'lodash/isEqual',
			'lodash/collection/forEach': 'lodash/forEach',
			'lodash/collection/each': 'lodash/each',
			'lodash/collection/pluck': 'lodash/map',
			'lodash/object/keys': 'lodash/keys',

		},
	},

	// webpack plugins
	plugins: WP_PLUGINS,
};
