
const path = require("path");
const webpack = require("webpack");
const _ = require("lodash");

const Factory = {
    //
    readCacheCompileInfo : function () {
    
    },
    isDllChange : function () {
         
    },

    compile : function (config, options, isWatch) {
        var fs = __emi__.fs;
        var wp = webpack(config);
        if  (options.isServer && fs) {
            wp.outputFileSystem = fs;
        }
        var promise = new Promise(function (resolve, reject) {
            if (_.isEmpty(config.entry)) {
              return  resolve({
                webpack : wp,
                webpackConfig : config
              });
            }
            
            var fn = function (err, stats) {
                if (err) throw err
                if (!program.quite) {
                    process.stdout.write(stats.toString({
                        colors: true,
                        modules: false,
                        children: false,
                        chunks: false,
                        chunkModules: false
                    }) + '\n\n')
                }
                resolve({
                    webpack : wp,
                    webpackConfig : config
                });
            }
            if (!isWatch) {
                wp.run(fn)
            } else {
                 wp.watch(options.watchOptions, fn);
            }
        }); 
        return promise;
    }

}

module.exports = Factory;
