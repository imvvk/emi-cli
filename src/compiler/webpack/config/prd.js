
const path = require('path')
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

  var extractOptions = emiConfig.extractOptions || (emiConfig.cssLoader  || { extract : {}}).extract; 

  var config = {
    devtool : false,
    mode : 'production',
    plugins :  [],
    optimization : {
      minimizer : []
    }
  }

  var minimizer = config.optimization.minimizer;
  var plugins = config.plugins;

  //压缩代码
  if (emiConfig.minify !== false) {
    minimizer.push(uglifyJsPlugin(emiConfig.minify));
  } else {
    optimization.minimize = false;
  }

  //使用HashedModuleIds 
  plugins.push(hashIdPlugin(emiConfig.HashedModuleIds));

  if (extractOptions !== false ) {
    plugins.push(extractTextPlugin(Object.assign({
      filename : 'styles/[name].[contenthash].css',
      chunkFilename : 'styles/[id].[contenthash].css'
    }, extractOptions)));
    minimizer.push(optimizeCssPlugin(emiConfig.optimizeCss));
  }
    
  //拷贝静态文件
  if (emiConfig.staticPath) {
    let opts = typeof emiConfig.staticPath  === 'string' ? [{
      from: path.join(__emi__.cwd, emiConfig.staticPath),
      to : path.join(outpath , emiConfig.staticPath),
      ignore: ['.*']
    }] : emiConfig.staticPath;
    plugins.push(copyWebpackPlugin(opts));
  }
    
  //分析打包
  if (emiConfig.analyze) {
    plugins.push(analyzePlugin(emiConfig.analyze))
  }
  return config;

}
    

