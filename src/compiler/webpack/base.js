/**
 * webpack 配置文件基础
 *
 ***/
var path = require("path");

var WebpackConfigKeys = [ "amd", "bail", "cache", "context", "dependencies", "devServer", "devtool", "entry", "externals", "loader", "module", "name", "node", "output", "performance", "plugins", "profile", "recordsInputPath", "recordsOutputPath", "recordsPath", "resolve", "resolveLoader", "stats", "target", "watch", "watchOptions"];

var OUTPUT =  {"dev": "dev", "prd" : "dist"};


//基础解析方法
var ConfigFactory = function (emi_config, basedir, env) {
    this.emi_config = emi_config;
    this.basedir = basedir;
    this.config = this._resolve(emi_config, basedir);
    this.env = env;
    this.outpath = this._outpath();
}

ConfigFactory.prototype = {
    //简单解析用户config 为dev prd 使用
    _resolve : function (config, basedir) {
        var wpconf = {}; 
        Object.keys(config).forEach(function (key) {
            if (~WebpackConfigKeys.indexOf(key)) {
                wpconf[key] = config[key]       
            }
        });

        wpconf.context = basedir;
        wpconf.plugins = wpconf.plugins || [];
        wpconf.module = wpconf.module || {};
        wpconf.resolve = wpconf.resolve || {};
        wpconf.resolveLoader = wpconf.resolveLoader || {};
        return wpconf;

    },
    _outpath : function () {
        var outpath = path.join(this.basedir, OUTPUT[this.env]);
        return outpath;
    },
    _prefixPath : function () {
        var pathMap = this.emi_config.pathMap ,
            env = this.env;
        if (!(pathMap && pathMap[env])) {
            return ""; 
        }
        return pathMap[env].prefixPath || "";
    },
    _publicPath : function () {
        var pathMap = this.emi_config.pathMap ,
            env = this.env;
        if (!(pathMap && pathMap[env])) {
            return ""; 
        }
        return pathMap[env].publicPath || "";
    },
    _filename : function () {
        if (this.env === "dev") {
            return "[name].js";
        } else {
            return "[name].[chunkhash].js";
        }
    },
    _join : function (a, b) {
        return path.posix.join(a,  b);
    },
    _isDev : function () {
        return this.env === "dev";
    },

    getConfig : function () {
        return this.config;
    },

    entryHandle : function () {
    },

    outHandle : function (config) {
         
    },
    resolveHandle : function (config) {
    
    
    },
    pluginHandle : function (config) {
    
    }
}


module.exports = ConfigFactory;
