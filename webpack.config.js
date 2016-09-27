var webpack = require("webpack");

module.exports = {
  entry: [
    "babel-polyfill",
    "./app/convui.js",
    "./app/3dsandbox.js"
  ],
  output: {
    path: __dirname + '/app',
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
  devtool: 'inline-source-map'
  // ,
  // plugins: [
  //   new webpack.BannerPlugin('require("source-map-support").install();',
  //                            { raw: true, entryOnly: false })
  // ]
};
