const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = env => {
  return {
    entry: {
      dev: './example/app.js' 
    },
    mode: 'development',
    // mode: env.NODE_ENV,
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
            }
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
    devtool: 'inline-source-map',
    devServer: {
      port: 8080,
      contentBase: path.join(__dirname, 'public'),
      publicPath: '/',
      hot: true
    },
    output: {
      library: 'graphin-vue',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      filename: 'graphin-vue.min.js',
    },
    plugins: [
      new MiniCssExtractPlugin(),
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        title: 'example',
        template: './public/index.html',
        chunks: ['dev'],
      })
    ]
  }
}