
/**
 * @file developer Server Copy from zdying hiipack
 * 
 */
require("colors");
var express = require('express');
var path = require('path');
var fs = require('fs');
var logger = log.namespace('server');
var config = require("../bootstrap/config.js");

var complier = require("../compiler/compiler.js");

// 中间件
var favicon = require('./middlewares/favicon');
var source = require('./middlewares/source');

var serverUtils = require("./serverUtils.js");

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

        var pc = config.getProject();

        // serverUtils.addProxyMiddleware(app, __emi__.cwd, pc.config);
        // handle fallback for HTML5 history API
        app.use(require('connect-history-api-fallback')())
 
        return serverUtils.addWebpackMiddleware(app, __emi__.cwd, pc.config).then(function () {
            serverUtils.addStaticMiddleware(app,  __emi__.cwd,pc.config);
            me.server = require('http').createServer(app).listen(port);
            if(program.https){

            }
            return new Promise(me.initEvents.bind(me));
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
                console.log(err.message);
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
            process.exit()
        });

        process.on('SIGTERM', function(){
            console.log('Bye Bye.'.bold.yellow);
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
        filePath = filePath || path.join(__hii__.cwd, req.url);

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

    getProjectInfoFromURL: function(url){
        //  url,  projectName,    env,    folder, fileName, version, fileExt,     paramsAndHash
        var reg = /\/(.*?)\/(src|prd|loc|dev)(\/.*)?\/(.*?)(@\w+)?(?:\.(\w+))([\#\?].*)?$/;
        var result = url.match(reg);

        if(result){
            return {
                projectName: result[1],
                env: result[2],
                folder: result[3],
                fileName: result[4],
                version: result[5],
                fileExt: result[6],
                paramsAndHash: result[7]
            }
        }else{
            return null
        }
    },

    sendCompiledFile: function(req, projInfo){
        var filePath = path.join(__hii__.codeTmpdir, req.url);

        filePath = filePath.replace(/@[\w+]+\.(js|css)/, '.$1').replace(/[\\\/]prd[\\\/]/, '/loc/');
        this.sendFile(req, filePath);
    }
}


module.exports = function start () {

    var mmfs = require("memory-fs");
    __emi__.fs = new mmfs();
    var server = new Server(9900);
    server.start().then(function (server) {
        console.log("server start");
    }).catch(function (err) {
        console.error("server error", err);
    }); 

}
