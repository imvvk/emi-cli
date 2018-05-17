
var path = require('path')
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

  var extractOptions = (emiConfig.cssLoader  || { extract : {}}).extract; 

  var config = {
    devtool : false,
    mode : 'production',
    plugins :  [],
  }

  var plugins = config.plugins;

  plugins.push(hashIdPlugin(emiConfig.HashedModuleIds));

  if (extractOptions) {
    plugins.push(extractTextPlugin(Object.assign({
      filename : 'styles/[name].[contenthash:8].css'
    }, extractOptions)));
  }

  if (emiConfig.optimizeCss) {
    plugins.push(optimizeCssPlugin(emiConfig.optimizeCss));
  }

  if (emiConfig.cssLoader && emiConfig.cssLoader.happypack) {
    var loaders = cssLoader.createHappypackLoaders(emiConfig.cssLoader, 'prd');
    Object.keys(loaders).forEach(function(key) {
      var _loaders  = loaders[key];
      plugins.push(key, _loaders);
    });
  }

  if (Object.keys(emiConfig.entry).length > 1 && emiConfig.commonPack) {
    config.plugins[1] =  new ExtractTextPlugin({
      filename : 'styles/[name].[contenthash:8].css',
      allChunks : true
    });

    config.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        name: '__common__',
        chunks : Object.keys(emiConfig.entry) 
      })
    );
  }

  if (emiConfig.minify !== false) {
    //plugins.push(uglifyJsPlugin(emiConfig.minify));
  }
  if (emiConfig.staticPath) {
    let opts = typeof emiConfig.staticPath  === 'string' ? {
      from: path.join(__emi__.cwd, emiConfig.staticPath),
      to : path.join(outpath , emiConfig.staticPath),
      ignore: ['.*']
    } : emiConfig.staticPath;
    plugins.push(copyWebpackPlugin(opts));
  }

  if (emiConfig.analyze) {
    plugins.push(analyzePlugin(emiConfig.analyze))
  }

  return config;

}
    

