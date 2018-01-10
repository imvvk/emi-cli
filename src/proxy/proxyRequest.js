
const _ = require('lodash');
const request = require('request');
const url = require('url');
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');

const proxyRequest = require('./pathRouter.js');

module.exports = proxyRequestHandler;

var matchFuns = {
    '5' : function (item, base, srvUrl, req, res, next) {
        var pathname = srvUrl.pathname;
        if (pathname === item.from) {
            proxyRequest(item.to, base, srvUrl, req, res, item); 
        }  else {
            next();
        } 
    },
    '4' : function (item, base, srvUrl, req, res, next) {
        var pathname = srvUrl.pathname;
        if (pathname.indexOf(item.from) === 0) {
            proxyRequest(item.to, base, srvUrl, req, res, item); 
        }  else {
            next();
        }
    },
    '3' : function (item, base, srvUrl, req, res, next) {
        var pathname = srvUrl.pathname;
        if (pathname.match(item.from)) {
            proxyRequest(item.to, base, srvUrl, req, res, item); 
        } else {
            next();
        }
    
    },
    '2' : function (item, base, srvUrl, req, res, next) {
        var pathname = srvUrl.pathname;
        if (pathname.indexOf(item.from) === 0) {
            proxyRequest(item.to, base, srvUrl, req, res, item); 
        }  else {
            next();
        }
    },
    '1' : function (item, base, srvUrl, req, res, next) {
        proxyRequest(item.to, base, srvUrl, req, res, item); 
    }

}


function directRequest(req, res) {
    var opts =  Object.assign({
        url : req.url 
    }, {
        method : req.method,
        agent : req.agent,
        auth : req.auth,
        headers : req.headers,
        body : req.body,
        followRedirect : false
    });
    var proxyReq = request(opts);
    req.pipe(proxyReq).on('error', (error)=> {
        log.error('proxy direct request error:', error.message); 
    });
    proxyReq.pipe(res).on('error', (error)=> {
        log.error('proxy direct response error:', error.message); 
    });
}

function proxyRequestHandler(hostConfig) {

    return function (req, res) {
        const srvUrl = url.parse(req.url);
        var hostname = srvUrl.hostname, pathname = srvUrl.pathname;

        if (hostConfig[hostname]) {
            console.log('req url >>: ', req.url);
            let config = hostConfig[hostname];
            let rules = config.rules || [];
            var base = {
                host : config.host+":"+config.port,
                root : config.root,
                hostname  : config.host,
                port : config.port
            }
            var i = 0, len = rules.length, item = rules[i];
           
            var next = function() {
                i++;
                item = rules[i]; 
                if (item && matchFuns[item.pri]) {
                    matchFuns[item.pri](item, base, srvUrl, req, res, next);
                } else {
                    //如果最后一个转发规则 不是1  即 from : '/' 
                    directRequest(req, res);
                }
            }
            if (item && matchFuns[item.pri]) {
                matchFuns[item.pri](item, base, srvUrl, req, res, next);
            } else {
                directRequest(req, res);
            }

        } else {
            directRequest(req, res);
        }
    }
}
