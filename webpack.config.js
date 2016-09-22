var webpack = require("webpack");

module.exports = {
  entry: [
    "babel-polyfill",
    "./app/main.js"
  ],
  output: {
    path: __dirname,
    filename: "app/bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components|3dparty)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
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
