
var webpack = require('webpack')

const {
  extractTextPlugin, 
  optimizeCssPlugin,
  hashIdPlugin, 
  uglifyJsPlugin, 
  copyWebpackPlugin,
  analyzePlugin,
  happyPackPlugin
} = require('../../utils/pluginFuncs.js');

module.exports = function (manifest, emiConfig , instance) {

    return {
        devtool : '#cheap-module-eval-source-map',
        mode : 'development',
        plugins : [
          new webpack.DllPlugin({
            path: manifest,
            name: "__lib__[name]__",
            context : __emi__.cwd  
          }),
          extractTextPlugin({
            filename : 'lib_[name].css',
            chunkFilename : 'lib_[id].css'
          })
        ]
    }

}
    

