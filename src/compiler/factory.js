
var path = require("path");
var webpack = require("webpack");


var Factory = {
    //
    readCacheCompileInfo : function () {
    
    },
    isDllChange : function () {
         
    },

    compile : function (config, options) {
        var fs = __emi__.fs;
      
        var wp = webpack(config);
        if  (options.isServer) {
            wp.outputFileSystem = fs;
        }
        var promise = new Promise(function (resolve, reject) {
            wp.run(function (err, stats) {
                if (err) throw err
                process.stdout.write(stats.toString({
                    colors: true,
                    modules: false,
                    children: false,
                    chunks: false,
                    chunkModules: false
                }) + '\n\n')
                resolve({
                    webpack : wp,
                    webpackConfig : config,
                    stats : stats
                });
            });
        }); 
        return promise;
    }

}

module.exports = Factory;
