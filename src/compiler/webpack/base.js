/**
 * webpack 配置文件基础
 *
 ***/
const path = require("path");
const _ = require("lodash");

const WebpackConfigKeys = [ "amd", "bail", "cache", "context", "dependencies", "devServer", "devtool", "entry", "externals", "loader", "mode", "module", "name", "node", "output", "optimization", "performance", "plugins", "profile", "recordsInputPath", "recordsOutputPath", "recordsPath", "resolve", "resolveLoader", "stats", "target", "watch", "watchOptions"];

const OUTPUT =  {"dev": "dev", "prd" : "dist"};


//基础解析方法

class ConfigFactory {

    constructor (emi_config, basedir, env) {
        this.emi_config = emi_config;
        this.basedir = basedir;
        this.config = this._resolve(emi_config, basedir);
        this.env = env;
    }

    /**
     * 解析为基础webpack 文件
     *
     * @param {Object } config emi.config.js
     * @param {String} basedir 项目启动目录
     */
    _resolve (config, basedir) {
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
    }

    mergeEnvConfig () {
        if (this.env === 'dev') {
            this.mergeDev();
        } else {
            this.mergePrd(); 
        } 
    }

    mergeDev () {

    }

    mergePrd () {

    }

    /**
     * 设置reslove.modules 增加emi node_module path
     * 为eslint 之类的服务
     */
    setResolve() {
        var resolve = this.config.resolve; 
        var modules = resolve.modules || [];
        var cmd_nodepath = path.join(__emi__.root, "node_modules");
        var pro_nodepath = path.join(__emi__.cwd, "node_modules");
        modules.splice(0, 0, pro_nodepath);
        modules.push(cmd_nodepath);
        resolve.modules = _.uniq(modules);
        return this;
    }

    setResolveLoaders () {

        var resolveLoader = this.config.resolveLoader;
        var modules = resolveLoader.modules || [];
        var alias = resolveLoader.alias || {};
        var cmd_nodepath = path.join(__emi__.root, "node_modules");
        var pro_nodepath = path.join(__emi__.cwd, "node_modules");
        modules.splice(0, 0, pro_nodepath);
        modules.push(cmd_nodepath);
        alias.sass = "sass-loader";
        alias['scss-loader'] = "sass-loader";
        alias.scss = "sass-loader";
        resolveLoader.modules = _.uniq(modules);
        resolveLoader.alias = alias;
        return this;

    }


    _outpath () {
        var outpath = path.join(this.basedir, OUTPUT[this.env]);
        return outpath;
    }

    /**
     * 旧版本保留
     *
     * @returns {String  publicPath}
     */
    _publicPath () {
        var pathMap = this.emi_config.pathMap ,
            env = this.env;
        if (!(pathMap && pathMap[env])) {
            return ""; 
        }
        return pathMap[env].publicPath || "";
    }
    _filename () {
        if (this.env === "dev") {
            return "[name].js";
        } else {
            return "[name].[chunkhash].js";
        }
    }
    
    _join (a, b) {
        return path.posix.join(a,  b);
    }
    _isDev () {
        return this.env === "dev";
    }

    getConfig () {
        return this.config;
    }

}


module.exports = ConfigFactory;
module.exports.outpath = function (basedir, env) {
    var outpath = path.join(basedir, OUTPUT[env]);
    return outpath;
};
