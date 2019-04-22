/**
 * @file server.js
 * @brief webpack developer server 
 * @author imvvk
 * @version 
 * @date 2018-07-03
 */

require("colors");
var express = require('express');
var path = require('path');
var fs = require('fs');
var opn = require('opn');
var detectPort = require('detect-port');
var url = require('url');

var logger = log.namespace('server');
var config = require("../bootstrap/config.js");

// 中间件
var favicon = require('serve-favicon');
var source = require('./middlewares/source.js');
var static = require('./middlewares/static.js');
var proxy = require('./middlewares/proxy.js');
var webpackDevMiddleware = require('webpack-dev-middleware')
var hotWebpackMiddleware = require('webpack-hot-middleware')

var webpack = require('../compiler/webpack.js');

var fileExplorer = require("../helpers/fileExplorer.js"); 

var customCmd = require('../helpers/customCmd.js');


var Server = function (port) {
    this.app = express();
    this.port = port;
}

Server.prototype = {

    start : function () {
        var me = this;
        var app = this.app, 
            port = this.port,
            pc = config.getProject();


        return detectPort(port)
            .then((_port) => {
                if (port != _port) {
                    throw new Error('端口被占用，请选择其他端口');
                    return;
                }
                if (pc.config.serverCommonds) {
                  this.startCustomCmd(pc.config.serverCommonds);
                }
                //开发环境 关闭etag 
                app.set('etag', false);
                app.use(favicon(path.join(__dirname, './source/favicon.ico')));
                app.use('/__source__/', source.bind(this));
                //proxy middleware
                proxy(app, __emi__.cwd, pc.config);
                return webpack.getInstance(pc.config, __emi__.cwd, 'dev');
            }).then((data) => {
                var compiler = data.webpack;
                var webpackConfig = data.config;
                var publicPath = webpackConfig.output.publicPath || '/';
                
                //单页面APP 中间件
                if (pc.config.historyApi) {
                    if (pc.config.historyApi === true) {
                        pc.config.historyApi = {}; 
                    }
                    app.use(require('connect-history-api-fallback')(pc.config.historyApi))
                }

                //热替换 中间件
                var hotMiddleware = hotWebpackMiddleware(compiler, {
                  log : () => {},
                  publicPath: webpackConfig.output.publicPath
                });
                app.use(hotMiddleware)

                //webpack dev middleware
                app.use(webpackDevMiddleware(compiler, {
                    publicPath : publicPath,
                    noInfo : program.quite,
                    stats: {
                      colors: true,
                      hash: false,
                      version: false,
                      timings: true,
                      assets: true,
                      chunks: false,
                      modules: false,
                      reasons: false,
                      children: false,
                      source: false,
                      errors: true,
                      errorDetails: false,
                      warnings: true,
                      publicPath: false
                    },
                    quite : program.quite,
                    watchOptions : config.watchOptions || {
                        aggregateTimeout: 300 
                    }
                }));
    

                var opened = false;


                if (pc.config.entryHtml && pc.config.entryHtml.length) {
                    // force page reload when html-webpack-plugin template changes
                    if (compiler.hooks) {
                        //webpack 4 support
                        compiler.hooks.compilation.tap('html-webpack-plugin-after-emit', (data) => {  
                          //默认关闭html 监听reload 
                          if (pc.config.reloadHtml) {
                            hotMiddleware.publish({  
                              action: 'reload'  
                            });  
                          }
                        });
                    } else {
                      compiler.plugin('compilation', (compilation) => {
                          compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
                              hotMiddleware.publish({ action: 'reload' });
                              cb();
                          })
                      });
                    }
                }

             
                //文件系统中间件
                app.use(me.fileExplor.bind(me));

                app.use(function(err, req, res, next) {
                    if (err.status && err.status  != "404") {
                        logger.error("server error:", err , err.stack);
                    }
                    res.status(err.status || 500);
                    res.send(err.message || "服务器错误");
                    logger.error(err);
                    logger.access(req);
                });

                me.server = require('http').createServer(app).listen(port);
                return new Promise(me.initEvents.bind(me)).then( (data) => {
                    // open it in the default browser when server start
                    if (pc.config.openBrowser) {
                        if (typeof pc.config.openBrowser === 'string') {
                            if (pc.config.openBrowser.match(/^https?:\/\.\//)) {
                                opn(pc.config.openBrowser); 
                            } else {
                                opn(data.url+ pc.config.openBrowser);
                            }
                        } else {
                            var entryHtml = pc.entryHtml;
                            if (entryHtml && entryHtml[0] && entryHtml[0].filename) {
                                opn(data.url+ path.join(publicPath, entryHtml[0].filename));
                            }
                        }
                    }
                    return data;
                });

            }).then((data) => {
                return data;
            });

    },


    startCustomCmd : function (cmdList) {
        if (cmdList && cmdList.length) {
            cmdList.forEach(function (data) {
                customCmd(data);
            });
        } 
    },

    initEvents: function(resolve, reject){
        var server = this.server;
        var port = this.port;
        var self = this;
        var serverCount = this.httpsServer ? 2 : 1;
        var count = 0;

        function onError(err){
            if(err.code === 'EADDRINUSE'){
                console.log('Port', String(port).bold.yellow, 'is already in use.');
            }else if(err.code === 'EACCES'){
                console.log('\nPermission denied.\nPlease try running this command again as root/Administrator.\n');
            }else{
                console.log(err);
            }
            self.close();
            reject(err);
        }

        function onListening(){
            if(serverCount === 2 && ++count < 2){
                return
            }

            var url = 'http://127.0.0.1:';

            resolve({
                port: port,
                url: url + port,
                httpsPort: 443,
                httpsUrl: url + 443,
                https: program.https,
                server: this.server,
                httpsServer: this.httpsServer
            });

          
        }

        server.on('error', onError);
        server.on('listening', onListening.bind(this));

        if(serverCount === 2){
            this.httpsServer.on('error', onError);
            this.httpsServer.on('listening', onListening.bind(this));
        }

        process.on("SIGINT", function(){
            console.log('\b\b  ');
            console.log('Bye Bye.'.bold.yellow);
            self.close();
            process.exit()
        });

        process.on('SIGTERM', function(){
            console.log('Bye Bye.'.bold.yellow);
            self.close();
            process.exit()
        });
    },

    close: function(){
        this.server.close();

        if(this.httpsServer){
            this.httpsServer.close();
        }
    },

    /**
     * 发送文件
     * @param req
     * @param filePath
     * @param env
     */
    sendFile: function(req, filePath){
        filePath = filePath || path.join(__emi__.cwd, req.url);

        logger.debug('send file: ' + filePath.bold);

        var res = req.res;

        res.set('Access-Control-Allow-Origin', '*');

        res.sendFile(filePath, function(err){
            if(err){
                res.statusCode = 404;
                res.end('404 Not Found');
                logger.error(err);
            }
            logger.access(req);
        });
    },


    fileExplor : function(req, res, next) {
        var uri = url.parse(req.originalUrl).path;
        var filePath = path.join(__emi__.cwd , uri);


        try{
            var stat = fs.statSync(filePath);
            if(stat.isDirectory()){
                // 如果目录没有以`/`结尾
                if(!/\/$/.test(uri)){
                    res.redirect(uri + '/');
                    return
                }

                fileExplorer.renderList(uri, filePath)
                    .then(function(html){
                        res.setHeader('Content-Type', 'text/html');
                        res.end(html);
                        logger.access(req);
                    });
            }else{
                this.sendFile(req)
            }
        }catch(e){
            next(e);
           
        }
    }

}


module.exports.start = function start (port) {

    var mmfs = require("memory-fs");
    __emi__.fs = new mmfs();
    var server = new Server(port);
    server.start().then(function (server) {
        log.info(("server start:"+ server.url).green);
    }).catch(function (err) {
        console.log("server error:" , err);
    }); 

}
