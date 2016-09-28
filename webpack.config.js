var webpack = require("webpack");
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    "babel-polyfill",
    "./app/convui.js",
    "./app/3dsandbox.js"
  ],
  output: {
    path: __dirname + '/public',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components|3dparty)/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  devtool: 'cheap-module-source-map',

  plugins: [
    new CopyWebpackPlugin([
      { context: 'app', from: '*.html' },
      { context: 'app', from: '*.css' },
      { context: 'app', from: 'assets', to: 'assets' },
      { context: 'app/configuration', from: 'camera', to: 'camera' },
    ])
  ]
};
