/**
* @file server.js
* @brief  nodejs  正向代理服务器  
* @author imvvk
* @date 2017-11-08
*/

const http =  require('http');
const https = require('https');
const net = require('net');
const url = require('url');
const request = require('request');
const fs = require('fs');
const path = require('path');

const proxyRequestHandler = require('./proxyRequest.js');
const parseHostRule = require('./parseHostRule.js');


class Server {
    constructor (port) {
        this.port = port || 1337;
    }

    start (config) {
        this.server = http.createServer(this.requsetHandler(config)).listen(this.port);  
        this.server.on('connect', this.connectHandler.bind(this, config));
        this.server.on('listening', ()=>{
            log.info('emi proxy server start :' , 'http://127.0.0.1:'+ this.port);
        }).on('error', function(err){
            log.error('emi proxy server error : ', err.message);
        })
    }

    requsetHandler (hostConfig)  {
        var config = parseHostRule(hostConfig);
        try {
            return proxyRequestHandler(config);
        } catch (e){
            console.error('http error=>', e);
        }
    }

    connectHandler (config, req, socketRequest, head) {
        console.log('url', req.url);
        const srvUrl = url.parse(`http://${req.url}`);
        console.log('srvUrl==>', srvUrl.port, srvUrl.hostname);
        //建立TCP 连接
        const proxySocket = net.connect(srvUrl.port, srvUrl.hostname, () => {
            socketRequest.write('HTTP/1.1 200 Connection Established\r\n\r\n');
            proxySocket.write(head);
            proxySocket.pipe(socketRequest).on('error', (err)=> {
                log.error('proxy socket pipe error:',  err.message); 
            });
        }).on('lookup', (err) => {
            if (err) {
                log.error('proxy socket lookup error:',  err.message); 
            }
        }).on('error', (e) => {
            log.error('proxy socket connect error:', e.message);
            socketRequest.end();
        });

        socketRequest.pipe(proxySocket).on('error', (error) => {
            log.error('proxy client socket pipe error:', error.message);
        });
         
    }

}




module.exports.start = function start(port, configPath) {
    var server = new Server(port);
    if (!path.isAbsolute(configPath)) {
        configPath = path.join(process.cwd(),  configPath)
    }
    log.info(configPath);
    server.start(require(configPath));
}

