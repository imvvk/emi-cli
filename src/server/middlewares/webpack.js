
var path = require("path");
var express = require("express");
var webpackDevMiddleware = require('webpack-dev-middleware')
var hotWebpackMiddleware = require('webpack-hot-middleware')

var complier = require("../compiler/compiler.js");


function _addMiddleware(app, compiler, config, basedir ) {
    var devMw = webpackDevMiddleware(compiler, {
        publicPath : config.publicPath || "/",
        quite : true
    });
    var hotMw = hotWebpackMiddleware(compiler);
        
    //inject mean use html webpack plugin
    if (config.htmlMode === "inject") {
        // force page reload when html-webpack-plugin template changes
        compiler.plugin('compilation', function (compilation) {
            compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
                hotMiddleware.publish({ action: 'reload' })
                cb()
            })
        })
    }

    app.use(devMs);
    app.use(hotMw);
}


module.exports = {

    addWebpackMiddleware : function (app, basedir, config) {
        
        return complier.create(basedir, config, "dev").then(function (result) {

            var dllCompiler = result.dllCompiler,
                compiler = result.compiler; 

            _addMiddleware(app, compiler, config, basedir);

            compiler.run(function (err, stats) {
                if (err) {
                    throw err; 
                } else {
                    if (stats.hasErrors()) {
                        var info = stats.toJson();
                        info.errors.forEach(function (err) {
                            console.log(err);
                        })
                        
                    }
                }
            }) 
        })
    },

    addProxyMiddleware : function (app, basedir, config) {
        // proxy api requests
        if (config.proxy) {
            var proxyTable = config.proxy;
            Object.keys(proxyTable).forEach(function (context) {
                var options = proxyTable[context]
                if (typeof options === 'string') {
                    options = { target: options }
                }
                app.use(proxyMiddleware(options.filter || context, options))
            })
        }
    },

    addStaticMiddleware : function (app, basedir, config) {
        if (config.staticPath) {
            var staticPath = path.join(basedir, config.staticPath);
            console.log("staticPath===",staticPath);
            app.use(staticPath, express.static(config.staticPath))
        }
    }

}

