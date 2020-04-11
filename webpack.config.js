const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = env => {
  return {
    entry: {
      // bundle: './src/index.ts',
      dev: './src/app.js'
    },
    mode: env.NODE_ENV,
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre',
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env', 'babel-preset-vue'],
            plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
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
            compilerOptions: {
              declaration: false,
            },
          },
        }
      ]
    },
    resolve: {
      extensions: ['*', '.ts', '.js', '.vue'],
      alias: {
        '@': 'src/'
      }
    },
    devtool: 'eval-source-map',
    devServer: {
      contentBase: path.join(__dirname, 'src', 'public'),
      publicPath: '/',
      hot: true
    },
    output: {
      library: 'graphin-vue',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'src', 'dist'),
      publicPath: '/',
      filename: 'graphin-vue.min.js',
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        title: 'example',
        template: './src/public/index.html',
        chunks: ['dev'],
      })
    ],
    externals: [
      {
        vue: 'Vue',
        lodash: '_'
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