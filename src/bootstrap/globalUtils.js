/***
 * exports to global 
 * use in emi.config.js
 ***/

const cssLoader = require("../compiler/utils/cssLoaders.js");
const fs = require('fs');
const path = require('path');
const request = require('sync-request');
const webpack = require('webpack');


var Utils = {
    
    filename : function (ext) {
        var prefix = "";
        if (ext === "css") {
            prefix = "styles";
        } else {
            prefix = "scripts" 
        }
        if (__emi__.env === "prd") {
            return prefix + "[name]." + ext; 
        } else {
            return prefix + "[name].[chunkhash]." + ext; 
        }
    },
    cssLoader : function (options)  {
        return cssLoader.cssLoader(options); 
    },

    assetPath : function (filname) {
        return filename; 
    },

    getEnv : function () {
        return __emi__.env; 
    },
    dllReferenceSync : function dllSync(uri, basedir, options) {
        if (!options && Object.prototype.toString.call(basedir) === '[object Object]') {
            options = basedir;
            basedir = null;
        } 
        var cwd = basedir || __emi__.cwd || process.cwd();
        var manifest, content = '';
        options = options || {};
        try {
            if (uri.match(/^https?:\/\//)) {
                var res = request('GET', uri);
                content = res.getBody();
            } else {
                if (!path.isAbsolute(uri)) {
                    uri = path.join(cwd, uir);
                }
                content = fs.readFileSync(uri,'utf-8');
            }

            if (content) {
                manifest = JSON.parse(content);
                return new webpack.DllReferencePlugin(Object.assign({},options, {
                    context : cwd,
                    manifest : manifest
                }));
            }
        } catch(e) {
            console.log('error uri: ', uri);
            console.log('error :', e);
        }
    } 
}

module.exports = Utils;
