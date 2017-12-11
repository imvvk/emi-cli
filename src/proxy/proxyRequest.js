
const _ = require('lodash');
const request = require('request');
const url = require('url');
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');

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


function fileRequest(topath, base, srvUrl, req, res, config) {
    var filepath ;
    var root = topath.root;
    var rewrites = topath.rewrites;
    var pathname = srvUrl.pathname;
    var matched = false;

    if (_.isPlainObject(rewrites)) {
        for (var k in rewrites) {
            var _topath = rewrites[key];
            var from = new RegExp(key);
            var rs = pathname.match(from);
            if (rs) {
                topath = _topath.replace(/\$(\d)/g, (m, i)=> {
                    return rs[i] || '';
                });
                matched = true;
                break;
            }
            
        }
    } else if(_.isArray(rewrites)) {
        for(var i=0, l = rewrites.length; i< l; i++) {
            var tmp = rewrites[i];
            var from = new RegExp(tmp[0]);
            var _topath = tmp[1]
            var rs = pathname.match(from);
            if (rs) {
                topath = _topath.replace(/\$(\d)/g, (m, i)=> {
                    return rs[i] || '';
                });
                matched = true;
                break;
            }
        }
    } 

    if (root) {
        if (matched) {
            filepath = path.join(root, topath);     
        } else {
            filepath = path.join(root, pathname);     
        }
    } else {
        log.error('没有配置root 选项');
        return;
    }
    var contentType = mime.lookup(filepath);
    res.setHeader('Content-Type', contentType);

    var readStream = fs.createReadStream(filepath);
    readStream.on('error', (e) => {
        res.write(e.message);
        res.end();
    }).pipe(res);
   
}

function httpRequest(topath, base, srvUrl, req, res, config) {
    var pathname = srvUrl.pathname;
    if (_.isRegExp(config.from)) {
        var rs = pathname.match(config.from);
        topath = topath.replace(/\$(\d)/g, (m, i)=> {
            return rs[i] || '';
        });
    } else {
        var reg = new RegExp('^'+config.from);
        topath = pathname.replace(reg, topath);
    }


    var proxyUrl = url.format(Object.assign({}, srvUrl, base , {
        pathname : topath,
        path : topath
    }))
    var opts =  Object.assign({
        uri : proxyUrl 
    }, {
        method : req.method,
        agent : req.agent,
        auth : req.auth,
        headers : req.headers,
        body : req.body,
        followRedirect : false
    });

    var proxyReq = request(opts);
    req.pipe(proxyReq);
    proxyReq.on('error', (e)=> {
        res.write(e.message);
        res.end();
    }).pipe(res);

}


function proxyRequest(topath, base, srvUrl, req, res, config) {
    if (_.isString(topath)) {
        httpRequest(topath, base, srvUrl, req, res, config);
    } else {
        fileRequest(topath, base, srvUrl, req, res, config);
    }
}

function directRequest(req, res) {
    var opts =  Object.assign({
        uri : req.url 
    }, {
        method : req.method,
        agent : req.agent,
        auth : req.auth,
        headers : req.headers,
        body : req.body,
        followRedirect : false
    });
    var proxyReq = request(opts);
    req.pipe(proxyReq);
    proxyReq.pipe(res);
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
