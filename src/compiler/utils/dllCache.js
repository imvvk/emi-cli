
var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
var outpath = require("../webpack/base.js").outpath;

var TMP = ".emi_cache";
var DLL_CACHE_NAME = "./dll.json";

module.exports.writeToCache = function writeToCache(basedir, data) {
    var p = path.join(basedir, TMP)
    log.info('write dll info to cache ...');
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p);
    }
    if (fs.existsSync(path.join(basedir, TMP, DLL_CACHE_NAME))) {
        fs.unlinkSync(path.join(basedir, TMP, DLL_CACHE_NAME));
    }
    var str = JSON.stringify(data);
    fs.writeFileSync(path.join(basedir, TMP, DLL_CACHE_NAME ), str);
    log.info('write dll info to cache success');
}

module.exports.checkCache = function checkCache (library, basedir, env) {
    var dllCache = getDllCacheData(basedir);
    if (dllCache) {
        var cacheLibStr = dllCache.libraryStr;
        var output = outpath(basedir, env);
        if (JSON.stringify(library) === cacheLibStr) {
            var files = dllCache.files || [];
            var isExistDllFilesJson = fs.existsSync(path.join(output, dllCache.filesPath));
            var isExistFiles = files.some(function (data) {
                var file = data.file;
                return fs.existsSync(file);
            });

            if (isExistDllFilesJson && isExistFiles) {
                try { 
                    var dllFilesJson = JSON.parse(fs.readFileSync(path.join(output,dllCache.filesPath)));

                    var isExistLibFiles = Object.keys(dllFilesJson).some(function (key) {
                        var file = dllFilesJson[key][0];
                        return fs.existsSync(path.join(output, file));
                    });


                    if (!isExistLibFiles) {
                        return false;
                    }
                    var buildPath = (env == 'prd' ? 'dist'  : 'dev' );
                    log.info('detect dll cached');
                    log.info('remove cache dll dir ...');
                    fse.removeSync(path.join(basedir, TMP, buildPath));
                    log.info('remove cache dll dir successed ');
                    log.info('copy dll dir to cached ... ');
                    fse.ensureDirSync(path.join(basedir, TMP, buildPath));
                    fse.ensureDirSync(path.join(basedir, TMP, buildPath, './dll'));
                    fse.copySync(path.join(output , './dll'), path.join(basedir, TMP, buildPath , './dll'));

                    Object.keys(dllFilesJson).forEach(function (key) {
                        var file = dllFilesJson[key][0];
                        var p = path.join(output, file);
                        fse.copySync(p, path.join(basedir, TMP, buildPath, file));
                    });

                    log.info('copy dll dir to cached successed ');
                    return true; 
                } catch (e) {
                    log.info('parse dll cache info error:', e && e.message);
                    return false;
                }
            }


        }
    }

    return false; 

}

module.exports.recoverDll = function (basedir, env) {
  log.info('copy cache dir to build path ... ');
  var buildPath = (env == 'prd' ? 'dist'  : 'dev' );
  fse.ensureDirSync(path.join(outpath(basedir, env)));
  fse.copySync(path.join(basedir, TMP , buildPath ), path.join(outpath(basedir, env)));
  log.info('copy cache dir to build path success ');
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

