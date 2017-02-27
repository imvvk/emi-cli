
var path = require("path");
var express = require("express");
var webpackDevMiddleware = require('webpack-dev-middleware')
var hotWebpackMiddleware = require('webpack-hot-middleware')

var complier = require("../compiler/compiler.js");
var complierUtils = require("../compiler/utils.js");

function _addMiddleware(app, compiler, config, basedir) {
    var devMw = webpackDevMiddleware(compiler, {
        publicPath : complierUtils.pulicPath(config.pathMap, "dev"),
        noInfo : program.quite,
        stats: {
            colors: true
        },
        quite : program.quite
    });
    var hotMw = hotWebpackMiddleware(compiler);
        
    //inject mean use html webpack plugin
    if (config.htmlMode === "inject") {
        // force page reload when html-webpack-plugin template changes
        compiler.plugin('compilation', function (compilation) {
            compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
                hotMw.publish({ action: 'reload' })
                cb()
            })
        })
    }

    app.use(devMw);
    app.use(hotMw);

    //hot-update
    /**
    app.get(/[\w\d]+\.hot\-update\.json([\#\?].*)?$/, function(req, res, next){
        next();
        //server.sendFile(req, path.join(__emi__.cwd, req.url))
    });
     ***/
}


module.exports = {

    addWebpackMiddleware : function (app, basedir, config) {
        return complier.create(basedir, config, "dev", true).then(function (result) {

            var dllCompiler = result.dllCompiler,
                compiler = result.compiler; 
            
            if (config.dllWatch) {
                dllCompiler.watch({}, function (err, stats) {
                    if (err) {
                        log.error(err);
                        return;
                    }
                    complierUtils.logStats(stats);

                    compiler.run(function (err, stats){
                        if (err) {
                            log.error(err);
                            return;
                        }
                        complierUtils.logStats(stats);
                    });
                })
            }

            _addMiddleware(app, compiler, config, basedir);
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
            log.debug("staticPath===",staticPath);
            var urlpath = config.staticPath.match(/^\//) ? config.staticPath : "/"+config.staticPath;
            
            app.use(urlpath, express.static(staticPath))
        }
    }

}


