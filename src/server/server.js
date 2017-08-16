
/**
 * @file developer Server Copy from zdying hiipack
 * 
 */
require("colors");
var express = require('express');
var path = require('path');
var fs = require('fs');
var opn = require('opn');
var logger = log.namespace('server');
var config = require("../bootstrap/config.js");

var complier = require("../compiler/compiler.js");

// 中间件
var favicon = require('./middlewares/favicon');
var source = require('./middlewares/source');
var preHandler = require('./middlewares/preHandler');

var fileExplorer = require("../helpers/fileExplorer.js"); 
var serverUtils =  require("./serverUtils.js");

var Server = function (port) {
    this.app = express();
    this.port = port;
}

Server.prototype = {

    start : function () {
        var me = this;
        var app = this.app, port = this.port;

        app.use('/__source__/', source.bind(this));
        app.get('*/favicon.ico', favicon.bind(this));

        app.use(preHandler);

        var pc = config.getProject();
        return serverUtils.addWebpackMiddleware(app, __emi__.cwd, pc.config).then(function () {
            serverUtils.addStaticMiddleware(app,  __emi__.cwd, pc.config);
            serverUtils.addProxyMiddleware(app, __emi__.cwd, pc.config);
            app.use(me.fileExplor.bind(me));
            if (pc.config.historyApi) {
                app.use(require('connect-history-api-fallback')())
            }
            me.server = require('http').createServer(app).listen(port);
            return new Promise(me.initEvents.bind(me)).then(function (data){
                  // open it in the default browser
                var entryHtml = pc.entryHtml;
                if (entryHtml && entryHtml[0] && entryHtml[0].filename) {
                    opn(data.url+ "/"+ entryHtml[0].filename);
                }
                return data;
            });
        });
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
        var url = req.url;
        var filePath = __emi__.cwd + url;

        try{
            var stat = fs.statSync(filePath);
            if(stat.isDirectory()){
                // 如果目录没有以`/`结尾
                if(!/\/$/.test(url)){
                    res.redirect(url + '/');
                    return
                }

                fileExplorer.renderList(url, filePath)
                    .then(function(html){
                        res.setHeader('Content-Type', 'text/html');
                        res.end(html);
                        logger.access(req);
                    });
            }else{
                this.sendFile(req)
            }
        }catch(e){
            res.statusCode = 404;
            res.end('404 Not Found');

            logger.error(e);
            logger.access(req);
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
        log.error("server error:", err);
    }); 

}
