

var fs = require("fs-extra");
var config = require("../bootstrap/config.js");
var compiler = require("./compiler.js");
var compilerUtils = require("./utils.js");


module.exports = function (isMin, isPackDll) {
    var pc = config.getProject();
    var env = isMin ? "prd" : "dev";

    fs.removeSync(compilerUtils.outpath(__emi__.cwd, env));

    compiler.create(__emi__.cwd, pc.config, env).then(function (result) {
        var dllCompiler = result.dllCompiler,
            compiler = result.compiler; 
        compiler.run(function (err, stats){
            if (err) {
                log.error(err);
                return;
            }
            compilerUtils.logStats(stats);
        });
    }).catch(function (err) {
        console.error(err);
    }) 
}
