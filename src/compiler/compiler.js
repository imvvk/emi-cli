
var webpack = require("webpack");
var MemoryFS = require("memory-fs");
var utils = require("./utils");

function _create(config) {
   return webpack(config);
}

module.exports = {
    create : function (basedir, config, env) {
        var dllCompiler, compiler;
        return new Promise(function (resolve, reject) {
            var fs = __emi__.fs;
            var _createCompiler = function () {
                var webpackConfig = utils.getConfig(basedir, config, env);
                return _create(webpackConfig);
            }
            var dllCompilerFn = function (err, stats) {
                if (err) {
                    reject(err);
                } else {
                    var info = stats.toJson();
                    if (stats.hasErrors())  {
                        reject(info.errors.join("\n\r"));
                    } else {
                        compiler =  _createCompiler();                  
                        if (env === "dev") {
                            compiler.outputFileSystem = fs; 
                        }
                        resolve({
                            dllcompiler : dllCompiler,
                            compiler : compiler
                        });
                    } 
                }
            }
            if (utils.hasDll(config)) {
                var dllConfig = utils.getDllConfig(basedir, config, env); 
                dllCompiler = _create(dllConfig);
                if (env === "dev") {
                    dllCompiler.outputFileSystem = fs; 
                }
                dllCompiler.run(dllCompilerFn);
                 
            } else {
                compiler = _createCompiler(); 
                resolve({compiler : compiler});
            }
        });

    }

}
