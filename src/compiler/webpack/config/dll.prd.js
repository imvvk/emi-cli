const webpack = require('webpack')

const {
  uglifyJsPlugin
} = require('../../utils/pluginFuncs.js');

module.exports = function (manifest, emiConfig, instance) {
    var config = {
        devtool : false,
        mode : 'production',
        optimization : {
          minimizer : [uglifyJsPlugin()]
        },
        plugins : [
            new webpack.DllPlugin({
                path: manifest,
                name: "__lib__[name]__",
                context : __emi__.cwd
            })
         ]
    }
    return config;

}
