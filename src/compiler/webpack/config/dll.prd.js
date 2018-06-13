
var webpack = require('webpack')
//var ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

var UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = function (manifest, emiConfig, instance) {
    var config = {
        plugins : [
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            new webpack.DllPlugin({
                path: manifest,
                name: "__lib__[name]__",
                context : __emi__.cwd
            })
         ]
    }
    if (emiConfig.minify !== false) {
      var minifyOpts = typeof emiConfig.minify === 'object' ? emiConfig.minify : {
        parallel : true,
        uglifyOptions: {
          output: {
            comments: false
          },
          compress: {
            warnings: false
          }
        },
        sourceMap: false,
      } 
      config.plugins.push( new UglifyJsPlugin(minifyOpts));
    }


    return config;

}
