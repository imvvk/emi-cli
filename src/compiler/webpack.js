var _ = require('lodash');
var path = require("path");
var webpack = require("webpack");
var dllCache = require("./utils/dllCache.js");
var Dll = require("./webpack/dll.js");
var Project = require("./webpack/project.js");



function getDllInstance(emiConfig, basedir, env) {
    var dll = new Dll(emiConfig, basedir, env); 
    return dll;
}


module.exports.getInstance = getInstance;
module.exports.getWebpackInstance = getWebpackInstance;
module.exports.getDllAndWebpackInstance = getDllAndWebpackInstance;

function getInstance(emiConfig, basedir, env) {
    
    if (emiConfig.library) {
        return getDllAndWebpackInstance(emiConfig, basedir, env);
    } else {
        return getWebpackInstance(emiConfig, basedir, env); 

    }

}

function getWebpackInstance(emiConfig, basedir, env) {
    
    return new Promise(function (resolve, reject) {
        try { 
            var project = new Project(emiConfig, basedir, env);
            var webpackConfig = project.getConfig();   
            var instance = webpack(webpackConfig);

            var fs = __emi__.fs;
            if (fs) {
                instance.outputFileSystem = fs;
            }

            resolve({
                webpack : instance, 
                config : webpackConfig
            });
        } catch (e) {
            reject(e); 
        }
    });

}


function getDllAndWebpackInstance(emiConfig, basedir, env) {

    return new Promise(function (resolve, reject) {
        var dll = new Dll(emiConfig, basedir, env);
        var dllConfig = dll.getConfig();
        var dllWebpack = webpack(dllConfig);
        var fs = __emi__.fs;
        if (fs) {
            dllWebpack.outputFileSystem = fs;
        }

        dllWebpack.run(function (err, stats) {
            if (err) {
                reject(err);
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
            try {
                var project = new Project(emiConfig, basedir, env);
                var webpackConfig = project.getConfig();   
                var instance = webpack(webpackConfig);
                var fs = __emi__.fs;

                if (fs) {
                    instance.outputFileSystem = fs;
                }
                resolve({
                    dll : dll,
                    project : project,
                    dllWebpack : dllWebpack,
                    dllConfig : dllConfig,
                    webpack : instance, 
                    config : webpackConfig
                });
            } catch (e) {
                reject(e);
            }
        });
    });
}
