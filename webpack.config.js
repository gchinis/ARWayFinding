module.exports = {
  entry: "./app/main.js",
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
  }
};
