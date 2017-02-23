
require("color");

var config = require("../../bootstrap/config.js");
var url = require("url");
var path = require("path");

var resloveReq;
if (config.isWorkspace) {
    var regs = config.getProjectRegs(), len = regs.length;
    resloveReq = function (req, res, next) {
        var pathname = req.path, key ,t;
        for (var i = 0, l = len; i < l; i++) {
            if (t = pathname.match(regs[i])) {
                key = t[1]; 
                break;
            }
        }
        if (key) {
            req.basedir = config.getProject(key).realpath; 
            req.config = config.getProject(key);
        } else {
            var e = new Error("not find match project key");
            next(e);
        } 

            
    }
} else {
    resloveReq = function (req, res, next) {
        req.basedir = __emi__.cwd; 
        req.config = config.getProject();
        _reslove(req, res, next);
    }
}


function _reslove(req, res, next) {
    if (_isComplie(req)) {
        _complie(req, res, next);
    } else {
        _sendFile(req, res, next);    
    }
}

function _isComplie(req) {
    var config = req.config;
    //html request
    var vpregx = new RegExp("^/"+config.virtualPath+"/");
    log.debug("vitualPath regx", vregx);
    if (vpregx.test(req.path)) {
        return true;
    } else {
        return false;
    }
}

function _sendFile(req, res) {

}

function _complie(req, res, next) {

}

module.exports = resloveReq;
