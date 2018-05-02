const path = require('path');
const qs = require('querystring');
const url = require('url');
const _ = require('lodash');
const request = require('request');
const mime = require('mime-types');
const fs = require('fs');


//nginx reg to node req args
const supports = [
    {
        reg : /\$arg_(\w+)/g,
        fn : function (uriObj, str, paramName) {
            var query = uriObj.query;
            return query[paramName] || '';
        }
    },
    {
        reg : /\$request_uri/g,
        fn : function (uriObj, str) {
            return uriObj.path;
        }
    },

    {
        reg : /\$host/g,
        fn : function (uriObj, str) {
            return uriObj.hostname; 
        }
    },
    {
        reg : /\$scheme/g,
        fn : function (uriObj, str) {
            return uriObj.protocol; 
        }
    },
    {
        reg : '/\$(args|query_string)/g',
        fn : function (uriObj) {
            return uriObj.query_string;
        }

    }
]

module.exports = proxyRequest;


function proxyRequest(location, base, srvUrl, req, res, config) {
    //file request
    if(location.root || location.alias)  {
        return fileRequest(location, base, srvUrl, req, res, config);
    } 
    //http request 
    else {
        return httpRequest(location, base, srvUrl, req, res, config);
    }

}

function httpRequest(location, base, srvUrl, req, res, config) {
    var proxyUrl; 
    var pathname = srvUrl.pathname;
    if (location.proxy_pass) {
        var proxy_pass = location.proxy_pass;
        if (_.isRegExp(config.from)) {
            var rs = pathname.match(config.from);
            proxy_pass = proxy_pass.replace(/\$(\d)/g, (m, i)=> {
                return rs[i] || '';
            });
        }
        proxyUrl = parseProxyPass(proxy_pass, srvUrl); 

    } else {
        var topath = location;
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

        proxyUrl = url.format(Object.assign({}, srvUrl, base , {
            pathname : topath,
            path : topath
        }))
    }

    var headers = Object.assign(req.headers, location.headers);
    var jar = request.jar(); 
    if (location.cookies) {
        var cookies = request.cookie(location.cookies);
        jar.setCookie(cookies, url.parse(proxyUrl).hostname); 
    }
    if (location.host) {
        headers['host'] = location.host;
    }

    if (headers['proxy-connection']) {
        headers['connection'] = headers['proxy-connection'];
        delete headers['proxy-connection'];
    }
    var gzip = headers['accept-encoding'] && headers['accept-encoding'].indexOf('gzip') > -1;

    var opts =  Object.assign({
        uri : proxyUrl 
    }, {
        method : req.method,
        agent : req.agent,
        auth : req.auth,
        headers : headers,
        body : req.body,
        jar : jar,
        gzip : gzip,
        followRedirect : false
    });

    var proxyReq = request(opts);
    req.pipe(proxyReq);
    proxyReq.on('error', (e)=> {
        res.write(e.message);
        res.end();
    }).pipe(res);

}

function fileRequest(location, base, srvUrl, req, res, config) {
    var filepath ;
    var rewrites = location.rewrites;
    var pathname = srvUrl.pathname;
    var matched = false;
    var root ;
    if (location.root) { 
        root = location.root;
    } else if (location.alias) {
        root = location.alias;
        var reg = _.isRegExp(config.from) ?  config.from : new RegExp('^'+config.from);
        pathname = pathname.replace(reg, '');
    } else {
        root = base.root; 
    }

    var topath;
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

/**
 * return string
var proxy_pass=  function (uriObj) {
    return string
}
 *
 **/

/**
 * 解析proxy_pass 为 url String
 *
 * @param {String or Function} proxy_pass proxy_pass 配置项
 * @param {String} uri 请求的URL 
 * @returns {String}
 */
function parseProxyPass(proxy_pass, uriObj) {
    let query  = uriObj.query ? qs.parse(uriObj.query) : {};
    uriObj.query_string = uriObj.query || '';
    uriObj.query = query;
    
    if (typeof proxy_pass === 'string') {
        let uriParsed = proxy_pass;
        let prefixArgs = [uriObj]; 
        supports.forEach((it)=> {
            uriParsed  = uriParsed.replace(it.reg, function () {
                var args = prefixArgs.concat(...arguments); 
                return it.fn.apply(it, args);
            })
        });

        if (uriParsed[uriParsed.length-1] === "/") {
            uriParsed += uriObj.path; 
        }

        return  uriParsed; 

    } else if (typeof proxy_pass === 'function') {
        return proxy_pass(uriObj) 
    } else {
        throw new Error('proxy_pass only support string or function'); 
    }

}
