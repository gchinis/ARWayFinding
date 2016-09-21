// Karma configuration

// Import the Webpack configuration, but remove its original entry
// point.
var webpackConfig = require('./webpack.config.js');
webpackConfig.entry = {};

module.exports = function(config) {
  config.set({
    // Standard Karma options
    // (https://karma-runner.github.io/1.0/config/configuration-file.html).
    basePath: '',
    frameworks: ['jasmine'],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity,

    files: [
      'bundle.js',
      'spec/browser/**/*.js',
      {pattern: 'spec/testAssets/*', watched: false, included: false, served: true, nocache: true},
    ],

    preprocessors: {
      'spec/**/*.js': ['webpack']
    },

    // plugins: [
    //   require('karma-webpack')
    // ],

    // karma-webpack options
    // (https://github.com/webpack/karma-webpack).
    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: true
    }
  });
}
