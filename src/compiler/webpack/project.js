
const _ = require("lodash");
const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackIncludeAssetsPlugin = require("html-webpack-include-assets-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");

const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: require('os').cpus().length });

const ConfigFactory = require("./base.js");
const prdConfig = require("./config/prd.js");
const devConfig = require("./config/dev.js");
const merge = require('../utils/merge.js');

const createCssLoader = require("../utils/cssLoaders.js");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const miniCssLoader = MiniCssExtractPlugin.loader;


class ProjectFactory  extends ConfigFactory {

  constructor(emi_config, basedir, env) {
    super(emi_config, basedir, env);
    this.outpath = this._outpath();
    this.manifestSeed = {};
    this.setEntry();
    this.mergeEnvConfig();
    this.setCustom();
  }

  mergeDev () {
    var outpath = this._outpath(); 
    var defConfig , outConfig;
    if (_.isFunction(this.emi_config.devConfig)) {
      outConfig = this.emi_config.devConfig(outpath, this.emi_config, this);
    }
    defConfig = devConfig(outpath, this.emi_config); 
    this.config = merge(defConfig, this.config, outConfig);
  }

  mergePrd () {
    var outpath = this._outpath(); 
    var defConfig , outConfig;
    if (_.isFunction(this.emi_config.prdConfig)) {
      outConfig = this.emi_config.prdConfig(outpath, this.emi_config, this);
    }
    defConfig = prdConfig(outpath, this.emi_config); 
    this.config = merge(defConfig, this.config, outConfig);
  }

  setEntry () {
    var config = this.config;
    if (this.env === 'dev' && !__emi__.watching) {
      var entry = config.entry;
      Object.keys(entry).forEach(function (name) {
        entry[name] = [path.join(__emi__.root, "./src/client/dev-client.js")].concat(entry[name]);
      });
    } 
    return this;
  }

  setCustom() {
    this.setOutput();
    this.setResolve();
    this.setResolveLoaders();
    this.setDllPlugin();
    this.setCssLoaders();
    this.setSplitChunks();
    this.setPlugins();
    this.insertHtml();
  }

  setCssLoaders() {
    var module = this.config.module,
      plugins = this.config.plugins,
      options = this.emi_config.cssLoader || {},
      rules = module.rules || [];

    var loaders = createCssLoader(options, this.env);

    //css 代码不extract 出来 和JS 合并一起
    var notExtract = options.extract === false;

    var parallel = !!(this.emi_config.parallel || options.happypack )  //兼容老版本 
    loaders.forEach( it => {
      var use = it.use;
      if (notExtract) {
        var index = use.indexOf(miniCssLoader);
        if (~index) {
          it.use.splice(index, 1, 'style-loader');
        }
      }
      if (parallel) {
        accelerateLoader(it, plugins);
      }
    }); 


    module.rules = rules.concat(loaders);
    return this;
  }

  setOutput() {
    var output = this.config.output || {};
    //强制重写为 emi 输出目录  
    output.path = this._outpath(); 
    if (!output.filename) {
      output.filename = this._filename();
    }
    if (!output.publicPath) {
      output.publicPath = this._publicPath();
    }
    this.config.output  = output;
    return this;
  }


  /**
   * webpack4 set custom splitChunks
   * such as css split base on entry
   *
   * @returns {this}
   */
  setSplitChunks() {
    var config = this.config;
    var optimization = config.optimization;
    var splitChunks = optimization.splitChunks;
    if (!splitChunks) {
      splitChunks = optimization.splitChunks = {};
    }
    var cacheGroups = splitChunks.splitChunks;
    if (!cacheGroups) {
      cacheGroups = splitChunks.cacheGroups = {};
    }
    if (this.emi_config.packNodeModules) {
      if(this.env ==='prd') {
        splitChunks.name = false;
      }
      splitChunks.automaticNameDelimiter = '_'; 
      var node_modules_str = /[\\/]node_modules[\\/]/.toString();
      const hasNodeVendor = Object.keys(cacheGroups).some(key => {
        var it = cacheGroups[cacheGroups];
        if (it.test && it.test.toString() === node_modules_str ) {
          return true;
        }
        return false
      });
      if (!hasNodeVendor) {
        cacheGroups.vendor  = {
            test: /[\\/]node_modules[\\/]/,
            chunks : 'all',
            priority: -10
       }
      }
    }
    return this;
    /**
    采用默认配置 
    var entry = this.config.entry;
    Object.keys(entry).forEach(key => {
      var styleName = key + 'Styles';
      if (!cacheGroups[styleName]) {
        cacheGroups[styleName] = {
          name: key,
          test: (m,c,entry = key) => { 
              return   m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry 
          },
          chunks: 'async',
          enforce: true
        }
      }
    });

    return this;
     **/

  }

  setPlugins() {
    var emiConfig = this.emi_config;
    var plugins = this.config.plugins;
    if (this.env !== 'dev') {
      plugins.push(new ManifestPlugin({
        seed : this.manifestSeed
      }))
    }
    return this;
  }
  setDllPlugin() {
    if (this.emi_config.library) {
      var publicPath = this.config.output.publicPath || '';
      var dlls = Object.keys(this.emi_config.library);
      var outpath = this.outpath;
      var plugins = this.config.plugins;
      var dllfiles = this._getDllFileJson({path : this.outpath});
      dlls.forEach((dll)=> {
        plugins.push(new webpack.DllReferencePlugin({
          context: this.basedir,
          manifest : this._getDllMainfest(path.join(outpath, "/dll/"+dll+"-manifest.json"))
        }))
        var seed = this.manifestSeed;
        var assets = Object.keys(dllfiles).map(function (key) {
          var file = publicPath + dllfiles[key].join(',')
          seed[key] = file;
          return file;
        });
      });
    }
    return this;
  }
  _getDllMainfest(filepath) {
    var fs = __emi__.fs || require('fs');
    var content = fs.readFileSync(filepath, 'utf-8').toString();
    return JSON.parse(content);
  }
  _getDllFileJson(options) {
    var fs = __emi__.fs || require('fs');
    var content = fs.readFileSync(path.join(options.path, "./dll/files.json"));
    var ctJson = JSON.parse(content);
    log.detail("DLL JSON CONTENT:", ctJson);
    return ctJson;
  }

  insertHtml() {
    var emiConfig = this.emi_config;
    var plugins = this.config.plugins;
    if (emiConfig.entryHtml && emiConfig.entryHtml.length) {
      var _conf = !this._isDev() ? {
        inject : true , 
        includeSiblingChunks : true,
        minify: {
          minifyCSS : true,
          minifyJS : true,
          removeComments: true,
          collapseWhitespace: true
        }
      } : {inject: true, includeSiblingChunks : true};

      emiConfig.entryHtml.forEach(function (conf) {
        var a = Object.assign({},_conf, conf);
        plugins.push(new HtmlWebpackPlugin(a));
      });
      //append dll resource 
      if (emiConfig.library) {
        var publicPath = this.config.output.publicPath;
        var dllfiles = this._getDllFileJson({path : this.outpath});
        var formatAsset = (it) => {
          var p = publicPath + it;
          if (p.match(/^(https?:)?\/\//)) {
            return {path : p};
          }
          return p;
        }
        if (!emiConfig.libraryManual) {
          var assets = Object.keys(dllfiles).map(function (key) {
            return dllfiles[key];
          });
          assets = _.flatten(assets).map(formatAsset);
          plugins.push(new HtmlWebpackIncludeAssetsPlugin({
            assets: assets,
            append: false, 
            publicPath : ''
          })) 
        } else if (emiConfig.libraryManual === 'group'){
          var vendorGroup = {};
          emiConfig.entryHtml.forEach(function (conf) {
            var chunks = conf.chunks || [];
            var assets = Object.keys(dllfiles).filter(function (name) {
              return chunks.indexOf(name) > -1;
            }).map(function (name) {
              return dllfiles[name];
            });

            if (assets.length) {
              var key = assets.join('_');
              if (!vendorGroup[key]) {
                vendorGroup[key] = {
                  assets: assets,
                  files : []
                };
              }
              vendorGroup[key].files.push(conf.filename);
            }
          });
          if (!_.isEmpty(vendorGroup)) {
            Object.keys(vendorGroup).forEach(function (key) {
              var data = vendorGroup[key];
              var assets = data.assets;
              var files = data.files;
              assets = _.flatten(assets).filter(it => it.match(/\.(js|css)$/)).map(formatAsset);
              plugins.push(new HtmlWebpackIncludeAssetsPlugin({
                assets: assets,
                files : files,
                append: false, 
                publicPath : ''
              })) 

            }); 
          } else if (_.isFunction(emiConfig.libraryManual)) {
            emiConfig.libraryManual.call(this, dllfiles, emiConfig);
          }

        }
      }
    }
  }

  _filename() {
    if (this.env === "dev") {
      return "scripts/[name].js";
    } else {
      return "scripts/[name].[chunkhash].js";
    }
  }


  getConfig () {

    //console.log('config===>',JSON.stringify(this.config, null , 2));
    return this.config;      
  }
}


function accelerateLoader(rule, plugins) {
  var loaders = rule.use;
  //转化loader 是除去第一个以外的 loader
  var transformLoaders = loaders.slice(1, loaders.length);
  var id = rule.test.toString().trim().replace('/\\.','').replace('$/', '');

  var happayPlugin = new HappyPack({
    id: id,
    threadPool: happyThreadPool,
    loaders : transformLoaders
  });

  loaders = [loaders[0], 'happypack/loader?id='+id];
  rule.use = loaders;
  plugins.push(happayPlugin);

}


function recursiveIssuer(m) {
  if (m.issuer) {
    return recursiveIssuer(m.issuer);
  } else if (m.name) {
    return m.name;
  } else {
    return false;
  }
}


module.exports = ProjectFactory;

