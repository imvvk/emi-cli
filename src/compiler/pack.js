

var fs = require("fs-extra");
var config = require("../bootstrap/config.js");
var dllCache = require("./utils/dllCache.js");
var webpack = require("./webpack.js");
var outpath = require("./webpack/base.js").outpath;

function cleanBuildDir (env) {
    var output = outpath(__emi__.cwd, env);
    log.info('remove dest path : ' , output);
    var output =  fs.removeSync(output);
    log.info('remove success');
    log.info('start building...');
}

module.exports = function (env) {
    var time = new Date().getTime();
    log.info("build start:", time);
    var pc = config.getProject();
    var promise ;
    if (pc.config.library) {
        if (dllCache.checkCache(pc.config.library, __emi__.cwd, env)) {
            cleanBuildDir(env);
            dllCache.recoverDll(__emi__.cwd, env);
            promise = webpack.getWebpackInstance(pc.config, __emi__.cwd, env);
        } else {
            cleanBuildDir(env);
            promise = webpack.getDllAndWebpackInstance(pc.config, __emi__.cwd, env);
        }
    } else {
        cleanBuildDir(env);
        promise = webpack.getWebpackInstance(pc.config, __emi__.cwd, env);
    }

    promise.then(function (data) {
        var instance = data.webpack;
        instance.run(function (err, stats){
            if (err) {
                console.log('compile error:', err);
                var time2 = new Date().getTime();
                log.info("build end:",time2, " spend time:", time2 - time);
                return; 
            }
            if (!program.quite) {
                process.stdout.write(stats.toString({
                    colors: true,
                    modules: false,
                    children: false,
                    chunks: false,
                    chunkModules: false
                }) + '\n\n')
            } 
            var time2 = new Date().getTime();
            if (data.dll) {
                var dllInfo =  data.dll.getBuildDllInfo();
                var library = pc.config.library;
                dllInfo.libraryStr = JSON.stringify(library);
                dllCache.writeToCache(__emi__.cwd, env ,dllInfo);
            }
            log.info("build end:",time2, " spend time:", time2 - time);
        });
    }).catch(function (err) {
        console.log('compile error:', err);
        var time2 = new Date().getTime();
        log.info("build end:",time2, " spend time:", time2 - time);
    });

}
