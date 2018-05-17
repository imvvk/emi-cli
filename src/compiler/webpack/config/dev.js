
var webpack = require('webpack')
var path = require('path');
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
var cssLoader = require('../../utils/cssLoaders.js');
var {
  extractTextPlugin, 
  optimizeCssPlugin,
  hashIdPlugin, 
  uglifyJsPlugin, 
  copyWebpackPlugin,
  analyzePlugin,
  happyPackPlugin
} = require('../../utils/pluginFuncs.js');

module.exports = function (outpath, emiConfig) {

  var config = {
    devtool : '#cheap-module-eval-source-map',
    mode : 'development'
    plugins : [
      new FriendlyErrorsPlugin()
    ]
  }

  if (!__emi__.watching) {
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin()
    );
  }

  if (emiConfig.cssLoader) {
    if (emiConfig.cssLoader.happypack) {
      var loaders = cssLoader.createHappypackLoaders(emiConfig.cssLoader, 'dev');
      Object.keys(loaders).forEach(function(key) {
        var _loaders  = loaders[key];
        config.plugins.push(
          happyPackPlugin(key, _loaders, true); 
        );
      });
    }

    if (emiConfig.cssLoader.packCss) {
      config.plugins.push(extractTextPlugin({
        filename : 'styles/[name].css'
      }));
    }

  }

  return config;

}

