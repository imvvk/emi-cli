
const _ = require("lodash");
const path = require("path");
const webpack = require("webpack");
const ConfigFactory = require("./base.js");

const devConfig = require("./config/dll.dev.js");
const prdConfig = require("./config/dll.prd.js");
const merge = require('../utils/merge.js');
const createCssLoader = require("../utils/cssLoaders.js");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const miniCssLoader = MiniCssExtractPlugin.loader;


class DllFactory  extends ConfigFactory {

    constructor(emi_config, basedir, env) {
        super(emi_config, basedir, env);
        var manifest = "dll/[name]-manifest.json";
        this.dll = {
            manifest : manifest,
            manifestPath : path.join(this._outpath(), manifest),
            files : []
        };
        //this.config.plugins = []; //dll 不继承 主plugin
        this.setEntry();
        this.mergeEnvConfig();
        this.setCustom();
    }

    /**
     * 将library 作为DLL 的入口文件
     *
     */
    setEntry() {
        this.config.entry = this.emi_config.library; 
        return this; 
    }

    setCustom() {
        this.setOutput();
        this.setCssLoaders();
        this.setResolve();
        this.setResolveLoaders();
        this.setPlugins();
    }

    mergeDev() {
        var defConfig , outConfig;
        if (_.isFunction(this.emi_config.devDllConfig)) {
            outConfig = this.emi_config.devDllConfig(this.dll.manifestPath, this.emi_config, this);
        }
        defConfig = devConfig(this.dll.manifestPath, this.emi_config, this); 
        this.config = merge(defConfig, this.config, outConfig);
        
    }

    mergePrd() {
        var defConfig , outConfig;
        if (_.isFunction(this.emi_config.prdDllConfig)) {
            outConfig = this.emi_config.prdDllConfig(this.dll.manifestPath, this.emi_config, this);
        } 
        defConfig = prdConfig(this.dll.manifestPath, this.emi_config, this); 
        this.config = merge(defConfig, this.config , outConfig);
 
    }
    

    setOutput() {
        var config = this.config;
        var output = Object.assign({} ,this.config.output);
        output.path = this._outpath(); 

        if (!output.filename) {
            output.filename = this._filename();
        }
        if (!output.publicPath) {
            output.publicPath = this._publicPath();
        }
        output.library = "__lib__[name]__";
        config.output  = output;
        return this;
    }


  
  setCssLoaders() {
    var module = this.config.module,
      plugins = this.config.plugins,
      options = {extension : ['css', 'scss', 'sass', 'less']},
      rules = module.rules || [];
    var loaders = createCssLoader(options, this.env);

    loaders.forEach( it => {
      var use = it.use;
      var index = use.indexOf(miniCssLoader);
    }); 

    module.rules = rules.concat(loaders);
    return this;
  }



  setPlugins() {
    var outpath = this._outpath();
    this.config.plugins.push(
      this._dllInfoTofile({path : outpath })
    ); 
    return this;

  }

  _dllInfoTofile(options) {
    var dll = this.dll;
    return function () {
      var fs = __emi__.fs || require('fs');
      this.hooks.emit.tapAsync("dllInfoTofile", function (compilation, callback, b, c) {
        var chunks = compilation.namedChunks;
        var dll_files_info = {};
        for (let name of chunks.keys()) {
          dll_files_info[name] = chunks.get(name).files;
          dll.files.push({ name : name, file : dll.manifestPath.replace(/\[name\]-manifest\.json$/, name + "-manifest.json")});
        }
        var dllFilesPath = path.join(options.path, "/dll/files.json"); 
        var fp = "dll/files.json";
        fs.writeFileSync(dllFilesPath, JSON.stringify(dll_files_info));
        dll.filesPath  = fp;
        log.debug("write dll files info to :", dllFilesPath);
        callback();
      });
    }
  }


  _filename() {
    if (this.env === "dev") {
      return "scripts/[name].js";
    } else {
      return "scripts/[name].[chunkhash].js";
    }
  }

  getBuildDllInfo () {
    return this.dll;    
  }


  getConfig () {
    return this.config;
  }

}


module.exports = DllFactory;
