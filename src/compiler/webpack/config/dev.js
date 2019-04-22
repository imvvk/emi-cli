
const webpack = require('webpack')
const path = require('path');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const cssLoader = require('../../utils/cssLoaders.js');
const {
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
    devtool : 'cheap-module-eval-source-map',
    mode : 'development',
    plugins : [
      new FriendlyErrorsPlugin()
    ],
    optimization : {
    }
  }

  if (!__emi__.watching) {
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin()
    );
  }

  if (emiConfig.cssLoader && emiConfig.cssLoader.packCss) {
    config.plugins.push(extractTextPlugin({
      filename : 'styles/[name].css',
      chunkFilename : 'styles/[id].css'
    }));
  }


  if (emiConfig.staticPath) {
    var opts = typeof emiConfig.staticPath === 'string' ? [
      {
        from: path.join(__emi__.cwd, emiConfig.staticPath),
        to : path.join(outpath , emiConfig.staticPath),
        ignore: ['.*']

      }
    ] :  emiConfig.staticPath; 
    config.plugins.push( copyWebpackPlugin(opts));
  }

  return config;

}

