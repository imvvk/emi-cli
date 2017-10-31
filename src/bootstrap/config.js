/**
* @加载配置文件
* @author imvvk
*/

var _ = require("lodash");
var fs = require("fs");
var path = require("path");

var PROJECTS_CONFIG = {};


var DEFAULT_CONFIG = {
    minify : true,  //是否最压缩 
    commonPack : true // 是否加入 公共包
}


var loaded = false;
module.exports = {
    load : function (refresh) {
        if (!loaded || refresh) {
            loaded = true;
            loadConfig(); 
        }
        if (_.isEmpty(PROJECTS_CONFIG))  {
            log.error("cant not load emi.config.js in current path, path is", __emi__.cwd);
            return false;
        }
        return true;
    },
    isWorkspace : function () {
        return PROJECTS_CONFIG.__isWorkspace;
    },
    getProject : function (key) {
        if (!PROJECTS_CONFIG.__isWorkspace) {
            return PROJECTS_CONFIG.__default;
        } else {
            return PROJECTS_CONFIG.porjects[key];
        }
    },
    getProjectRegs : function () {
        return PROJECTS_CONFIG.regs; 
    },
    getProjectOriginConfig : function (key) {
        var config = this.getProject(key);
        if (config) {
            return config.config; 
        }
    },
    getAll : function () {
    
    }
}

function loadConfig() {
    var cwd = process.cwd();
    var config = _.merge({}, DEFAULT_CONFIG,  _load(cwd));

    var projects;

    if (config) {
        projects = config.projects;

        if (projects) {
            PROJECTS_CONFIG.__isWorkspace = true;
            var pc = PROJECTS_CONFIG.projects ={};
            var prefixPathRegs = PROJECTS_CONFIG.regs = [];

            Object.keys(projects_config).forEach(function (key) {
                var projectPath = rmPrefixDot(projects[key]);
                var realpath = path.join(cwd, projectPath);
                pc[key] = _resolve(_load(realpath, projectPath));
                pc[key].realpath = realpath;
                prefixPathRegs.push(new RegExp("^/("+key+")/"));
            });

        } else {
            PROJECTS_CONFIG.__isWorkspace = false;
            PROJECTS_CONFIG.__default = _resolve(config);
        }
        return true;
    }

    return false; 

    function _load(p) {
        var content, config;
        var root = path.parse(p).root;
        try {
            var configjs =  getConfigPath(p, root);
            //content = fs.readFileSync(path.join(p, "./emi.config.js"), "utf-8");
            //var configjs = path.join(p, "./emi.config.js");
            var cwd = path.parse(configjs).dir;
            if (cwd != __emi__.cwd) {
                process.chdir(cwd);
                __emi__.cwd = cwd;
            }
            config = require(configjs);
        } catch(e) {
            log.error("load config fail in ", p );
            log.error("error : ", e);
        }
        return config;
    }
    function getConfigPath(p, root) {

        if (p === root) {
            return;
        }
        var configPath =  path.join(p, "./emi.config.js");

        if (fs.existsSync(configPath)) {
            return configPath;
        } else {
            return getConfigPath(path.join(p, '../'), root); 
        }
    }

    function _resolve(config, projectPath) {
        if (!config) {
            return null;
        }
        var entry = config.entry;
        var entryHtml = config.entryHtml =  o2a(config.entryHtml);
        var virtualPath = _getVirtualHtmlPath(config, projectPath);
        var htmlMode = config.htmlMode;

        if (htmlMode === "inject") {
            if (!entryHtml) {
                log.error("html inject mode but not set entry_html in config");
            } else {
                entryHtml = entryHtml.map(function (html){
                    return {
                        filename : html.filename,
                        chunks : html.chunks
                    } 
                });
            }
        }

        var resolved = {
            entry : o2a(entry),
            entryHtml : entryHtml,
            virtualPath : virtualPath,
            publicPath : _getPublicPath(config),
            config : config,
        }
        return resolved;
    }   

}

function _getPublicPath(config) {
    return (config.output || {}).publicPath || "/";
}

function _getVirtualHtmlPath (config, projectPath) {
    var output = config.output || {};
    var distpath = output.path || "";
    var cwd = __emi__.cwd;
    var virtualPath;

    if (projectPath) {
        if (/^\//.test(distpath)) {
           virtualPath = path.relative(path.join(cwd, projectPath), distpath);
        } else {
           virtualPath = path.join(projectPath, distpath)
        }
    } else {
        if (/^\//.test(distpath)) {
            virtualPath = path.relative(cwd, distpath) || "/";
        } else {
            virtualPath = rmPrefixDot(distpath);
        }
    }
    return virtualPath;
}

function rmPrefixDot(str) {
    return str.replace(/^\.\//, "");
}

function o2a(obj) {
    if (typeof obj === "string") {
        return [obj];
    } else if (Array.isArray(obj)) {
        return obj; 
    } else if (obj == null) {
        return obj;
    }
    return Object.keys(obj).map(function (key) {
        return {
            key : key,
            value : obj[key] 
        } 
    });
}






