const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);

// Transpile react-native and react-native-web source
const babelLoaderConfig = {
  test: /\.(tsx?|jsx?)$/,
  include: [
    path.resolve(appDirectory, 'index.web.js'),
    path.resolve(appDirectory, 'App.tsx'),
    path.resolve(appDirectory, 'src'),
    path.resolve(appDirectory, 'node_modules/react-native-web'),
    path.resolve(appDirectory, 'node_modules/@react-native'),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets: [
        ['@babel/preset-env', {targets: {browsers: ['last 2 versions']}, loose: true}],
        ['@babel/preset-react', {runtime: 'automatic'}],
        '@babel/preset-typescript',
      ],
      plugins: [
        '@babel/plugin-transform-runtime',
        ['@babel/plugin-transform-private-methods', {loose: true}],
        ['@babel/plugin-transform-private-property-in-object', {loose: true}],
      ],
    },
  },
};

module.exports = {
  mode: 'development',
  entry: path.resolve(appDirectory, 'index.web.js'),
  output: {
    path: path.resolve(appDirectory, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    alias: {
      'react-native$': 'react-native-web',
    },
  },
  module: {
    rules: [babelLoaderConfig],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(appDirectory, 'web', 'index.html'),
    }),
  ],
  devServer: {
    port: 8080,
    hot: true,
    open: true,
  },
};
