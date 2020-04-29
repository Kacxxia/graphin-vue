const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = env => {
  return {
    entry: {
      bundle: './src/index.ts',
    },
    mode: env.NODE_ENV,
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre',
          exclude: [path.resolve('node_modules')]
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env', 'babel-preset-vue'],
            plugins: [['@babel/plugin-proposal-class-properties', { loose: true }], '@babel/plugin-proposal-optional-chaining'],
          },
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          exclude: /node_modules/
        },
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            transpileOnly: true,
            compilerOptions: {
              declaration: false,
            },
          },
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.less$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader', // translates CSS into CommonJS
            },
            {
              loader: 'less-loader', // compiles Less to CSS
            },
          ],
          sideEffects: true,
        }
      ]
    },
    resolve: {
      extensions: ['*', '.ts', '.js', '.vue'],
      alias: {
        '@': '/src/'
      }
    },
    devtool: 'cheap-module-source-map',
    output: {
      library: 'graphin-vue',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      filename: 'graphin-vue.min.js',
    },
    plugins: [
      new MiniCssExtractPlugin(),
      new VueLoaderPlugin()
    ],
    externals: [
      {
        vue: 'vue',
        lodash: 'lodash'
      },
      (context, request, callback) => {
        if (request === 'lodash') {
          return callback(null, 'lodash');
        }
        if (/lodash\//.test(request)) {
            // lodash/isArray
            const paths = request.split('/');
            // lodash or lodash-es
            paths[0] = 'lodash';
            // lodash.isArray
            return callback(null, paths.join('.'));
        }
        if (/lodash\./.test(request)) {
            // lodash.debounce
            const paths = request.split('.');
            // lodash or lodash-es
            paths[0] = 'lodash';
            // lodash.debounce
            return callback(null, paths.join('.'));
        }
        callback();
        }
    ],
  }
}