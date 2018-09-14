const webpack = require('webpack')

const {
  extractTextPlugin,
  optimizeCssPlugin,
  uglifyJsPlugin
} = require('../../utils/pluginFuncs.js');

module.exports = function (manifest, emiConfig, instance) {
    var config = {
        devtool : false,
        mode : 'production',
        optimization : {
          minimizer : [uglifyJsPlugin(), optimizeCssPlugin()]
        },
        plugins : [
            new webpack.DllPlugin({
                path: manifest,
                name: "__lib__[name]__",
                context : __emi__.cwd
            }),
            extractTextPlugin({
              filename : 'styles/lib_[name].[contenthash].css',
              chunkFilename : 'styles/lib_[id].[contenthash].css'
            })
         ]
    }
    return config;

}
