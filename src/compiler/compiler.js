
var _ = require("lodash");
var Dll = require("./webpack/dll.js");
var Project = require("./webpack/project.js");
var Factory = require("./factory.js");
var webpack = require("webpack");
var fs = require("fs");
var fse = require("fs-extra");
var compilerUtils = require("./utils.js");
var path = require("path");

var TMP = ".emi_cache";
var DLL_CACHE_NAME = "./dll.json";
function writeToCache(basedir, data) {
    var p = path.join(basedir, TMP)
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p);
    }
    fse.emptyDirSync(p);
    var str = JSON.stringify(data);
    fs.writeFileSync(path.join(basedir, TMP, DLL_CACHE_NAME ), str);
}

function getDllCacheData(basedir) {
    if (!fs.existsSync(path.join(basedir, TMP))) {
        return; 
    }
    try {
        var data = fs.readFileSync(path.join(basedir, TMP, DLL_CACHE_NAME));
        if (!data) {
            return ;
        }
        var dlljson = JSON.parse(data);
        return dlljson;
    } catch(e) {
        console.log("dll cache parse error:") ;
        console.log(e.message);
    }
}

module.exports.compile = function (config, basedir, env) {
    var isServer = false;
    var options = {
        isServer : isServer 
    }
    var output = compilerUtils.outpath(__emi__.cwd, env);
    var dll, project;
    if (config.library) {
        var dllCache = getDllCacheData(basedir);
        //判断dll 是否已经打包过 并且有没有发生变化 如果没有变化则使用原来的 
        if (dllCache) {
            var cacheLibStr = dllCache.libraryStr;
            if (JSON.stringify(config.library) === cacheLibStr) {
                var dllManifestPath = dllCache.manifestPath;
                var filesPath = dllCache.filesPath;
                var dllfiles = [];
                if (fs.existsSync(path.join(output,dllManifestPath)) 
                    && fs.existsSync(path.join(output,filesPath))) {
                    dllfiles.push(dllManifestPath);
                    dllfiles.push(filesPath);
                    try {
                        var dllFilesJson = JSON.parse(fs.readFileSync(path.join(output,filesPath)));
                        if (dllFilesJson) {

                            Object.keys(dllFilesJson).forEach(function (key) {
                                dllfiles.push(dllFilesJson[key][0]);
                            });

                            dllfiles.forEach(function (file) {
                                fse.copySync(path.join(output, file), path.join(basedir, TMP, file)) ;
                            });

                            fse.removeSync(output);
                            
                            dllfiles.forEach(function (file) {
                                fse.moveSync(path.join(basedir, TMP, file), path.join(output, file)) ;
                            });
                            project= new Project(config,basedir , env, isServer);
                            return Factory.compile(project.getConfig(), options);
                        }
                    } catch(e) {
                        console.log("dll file info reslove error:") ;
                        console.log(e.message);
                    }
                }
            } 
        }
        dll = new Dll(config, basedir, env, isServer);
        return Factory.compile(dll.getConfig(), options).then(function(data) {
            project= new Project(config, basedir, env, isServer);
            return Factory.compile(project.getConfig(), options).then(function (pjdata) {
                pjdata.dll = data.webpack;
                var dllInfo = dll.getBuildDllInfo();
                if (!_.isEmpty(dllInfo)) {
                    dllInfo.libraryStr = JSON.stringify(config.library);
                    writeToCache(basedir, dllInfo); 
                }
                return pjdata;
            });
        });
    } else {
        project= new Project(config,basedir , env, isServer);
        return Factory.compile(project.getConfig(), options);
    }
}



module.exports.compileInServer = function (config, basedir, env) {
    var isServer = true;
    var options = {
        isServer : isServer 
    }
    if (config.library) {
        var dll = new Dll(config, basedir, env, isServer);
        return Factory.compile(dll.getConfig(), options).then(function(data) {
            var project = new Project(config, basedir, env, isServer);
            var pjConfig = project.getConfig();
            var fs = __emi__.fs;
            var wp = webpack(pjConfig);
            wp.outputFileSystem = fs;
            return {
                dll : data.webpack,
                webpack : wp,
                webpackConfig : pjConfig 
            }
        });
    } else {
        var project= new Project(config, basedir, env, isServer);
        return new Promise(function (resolve, reject) {
            var pjConfig = project.getConfig();
            var fs = __emi__.fs;
            var wp = webpack(pjConfig);
            wp.outputFileSystem = fs;
            
            resolve({
                webpack : wp,
                webpackConfig : pjConfig
            }) 
        });
        //return Factory.compile(project.getConfig(), options);
    }
}


module.exports.compileWatcher = function (config, basedir, env, fs) {
    var wp, wpWatching;
    if (config.library) {
        var dll = new Dll(config, basedir, env);
        var dllwp = webpack(dll.getConfig());
        if (fs) {
            dllwp.outputFileSystem = fs; 
        }
        var dllwatching = dllwp.watch(config.watchOptions || {}, function (err, stats) {
            if (err) throw err;
            process.stdout.write(stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n\n');

            if(!wp) {
                var project = new Project(config, basedir, env);
                var pjConfig = project.getConfig();
                var wp = webpack(pjConfig);
                if (fs) {
                    wp.outputFileSystem = fs;
                }
                
                wpWatching = wp.watch(config.watchOptions || {}, function (err, stats) {
                    if (err) throw err;
                    process.stdout.write(stats.toString({
                        colors: true,
                        modules: false,
                        children: false,
                        chunks: false,
                        chunkModules: false
                    }) + '\n\n');
                });
            }
        });

    } else {
        var project = new Project(config, basedir, env);
        var pjConfig = project.getConfig();
        var wp = webpack(pjConfig);
        if (fs) {
            wp.outputFileSystem = fs;
        }

        wpWatching = wp.watch(config.watchOptions || {}, function (err, stats) {
            if (err) throw err;
            process.stdout.write(stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n\n');
        });
    }

}






