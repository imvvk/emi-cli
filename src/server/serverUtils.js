
var path = require("path");
var express = require("express");
var webpackDevMiddleware = require('webpack-dev-middleware')
var hotWebpackMiddleware = require('webpack-hot-middleware')
var proxyMiddleware = require('http-proxy-middleware');


var compiler = require("../compiler/compiler.js");
var complierUtils = require("../compiler/utils.js");


module.exports = {

    addWebpackMiddleware : function (app, basedir, config) {
        return compiler.compileInServer(config, basedir, "dev").then(function (data) {
            var compiler = data.webpack;
            var devMw = webpackDevMiddleware(compiler, {
                publicPath : data.webpackConfig.output.publicPath || "",
                noInfo : program.quite,
                stats: {
                    colors: true
                },
                quite : program.quite,
                watchOptions : config.watchOptions || {
                    aggregateTimeout: 300 
                }
                
            });
            var hotMw = hotWebpackMiddleware(compiler, {
                log : false 
            });


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
        })
    },

    addProxyMiddleware : function (app, basedir, config) {
        // proxy api requests
        if (config.proxyTable) {
            var proxyTable = config.proxyTable;
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


