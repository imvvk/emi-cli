
const http =  require('http');
const https = require('https');
const net = require('net');
const url = require('url');
const request = require('request');
const fs = require('fs');
const path = require('path');

const proxyRequestHandler = require('./proxyRequest.js');
const parseHostRule = require('./parseHostRule.js');

const defaultCert = {
    key : path.join(__dirname, '../ssl/emi/private.pem'),
    cert : path.join(__dirname, '../ssl/emi/ca.cer')
}

class Server {
    constructor (port, httpsPort) {
        this.port = port || 1337;
        this.httpsPort = httpsPort || 1336; 
    }

    start (config) {
        var httpsOpts = {
            key: fs.readFileSync(defaultCert.key),
            cert: fs.readFileSync(defaultCert.cert),
        };
        this.server = http.createServer(this.requsetHandler(config)).listen(this.port);  
        //this.httpsServer = https.createServer(httpsOpts, this.requsetHandler(config)).listen(this.httpsPort);
        this.server.on('connect', this.connectHandler.bind(this, config));
        this.server.on('listening', ()=>{
            log.info('emi proxy server start :' , 'http://127.0.0.1:'+ this.port);
        }).on('error', function(err){
            log.error('emi proxy server error : ', err.message);
        })
    }

    requsetHandler (hostConfig)  {
        var config = parseHostRule(hostConfig);
        return proxyRequestHandler(config);
    }

    connectHandler (config, req, socketRequest, head) {
        const srvUrl = url.parse(`http://${req.url}`);
        if (config[srvUrl.hostname]) {
            srvUrl.port = this.httpsPort;
            srvUrl.hostname = '127.0.0.1';
        }

        const proxySocket = net.connect(srvUrl.port, srvUrl.hostname, () => {

            socketRequest.write('HTTP/1.1 200 Connection Established\r\n\r\n');
            proxySocket.write(head);
            proxySocket.pipe(socketRequest);
        }).on('error', (e) => {
            console.log('error=>', e);
            socketRequest.end();
        });

        socketRequest.pipe(proxySocket);
         
    }

}




module.exports.start = function start(port, configPath) {
    var server = new Server(port);
    if (!path.isAbsolute(configPath)) {
        configPath = path.join(process.cwd(),  configPath)
    }
    console.log(configPath);
    server.start(require(configPath));
}

