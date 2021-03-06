const webpack = require('webpack');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const SizePlugin = require('size-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const packageJson = require('./package.json');

const isDev = process.env.NODE_ENV === 'development';
const copyPaths = [
  'build/icon.ico',
  '.env',
  'build/icon.png',
  'package.json',
  { from: 'src/electron/icon/Icon-512x512.png', to: 'icon/Icon-512x512.png' },
  { from: 'src/electron/main.js', to: 'main.js' },
  { from: 'src/electron/main', to: 'main' },
  { from: 'src/electron/oauth2.js', to: 'oauth2.js' },
  { from: 'src/electron/updater.js', to: 'updater.js' },
  { from: 'src/icons', to: 'src/icons' },
  { from: 'node_modules/leaflet/dist/images', to: 'src/img' }
];

if (isDev) {
  copyPaths.push({ from: 'test/dev-app-update.yml', to: 'dev-app-update.yml' });
}

module.exports = {
  resolve: {
    modules: [path.resolve(__dirname, './src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'src/fonts/[name].[ext]'
          }
        }
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'src/img/[name].[ext]'
          }
        }
      },
      {
        test: /\.(svg)(\?.*)?$/i,
        use: {
          loader: 'url-loader',
          options: {
            name: 'src/icons/[name].[ext]'
          }
        }
      }
    ]
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new SizePlugin(),
    new webpack.DefinePlugin({
      'global.GENTLY': false,
      'process.browser': true
    }),
    new HtmlWebPackPlugin({
      title: 'Gisto',
      favicon: './build/icon.png',
      template: './src/index.html',
      filename: './index.html'
    }),
    new HtmlWebPackPlugin({
      version: packageJson.version,
      template: './src/loading.html',
      filename: './loading.html',
      inject: false
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: true
    }),
    new MonacoWebpackPlugin(),
    new CopyWebpackPlugin(copyPaths)
  ],
  target: 'electron-renderer'
};
