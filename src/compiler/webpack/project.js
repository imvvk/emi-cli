
var _ = require("lodash");
var path = require("path");
var webpack = require("webpack");

var HtmlWebpackPlugin = require("html-webpack-plugin");
var HtmlWebpackIncludeAssetsPlugin = require("html-webpack-include-assets-plugin");
var ManifestPlugin = require("webpack-manifest-plugin");

var ConfigFactory = require("./base.js");
var prdConfig = require("./config/prd.js");
var devConfig = require("./config/dev.js");
var merge = require('../utils/merge.js');

var createCssLoader = require("../utils/cssLoaders.js");


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
        this.setPlugins();
        this.insertHtml();
    }

    setCssLoaders() {
        var module = this.config.module,
            rules = module.rules || [],
            options = this.emi_config.cssLoader;

        var loaders = createCssLoader(options, this.env);
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
                    var file = dllfiles[key][0]
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
                chunksSortMode: 'dependency',
                minify: {
                    minifyCSS : true,
                    minifyJS : true,
                    removeComments: true,
                    collapseWhitespace: true
                }
            } : {inject: true,   chunksSortMode: 'dependency'};

            var commonPacks = [];
            if (emiConfig.commonPack) {
                commonPacks = ['__common__'];
            }
            emiConfig.entryHtml.forEach(function (conf) {
                var a = Object.assign({},_conf, conf);
                if (a.chunks && commonPacks.length) {
                    a.chunks = commonPacks.concat(a.chunks);
                }
                plugins.push(new HtmlWebpackPlugin(a));
            });
            //append dll resource 
            if (emiConfig.library) {
                var dllfiles = this._getDllFileJson({path : this.outpath});
                if (!emiConfig.libraryManual) {
                    var assets = Object.keys(dllfiles).map(function (key) {
                        var file = dllfiles[key][0];
                        return file;
                    });
                    plugins.push(new HtmlWebpackIncludeAssetsPlugin({
                        assets: assets,
                        append: false, 
                    })) 
                } else if (emiConfig.libraryManual === 'group'){
                    var vendorGroup = {};
                    emiConfig.entryHtml.forEach(function (conf) {
                        var chunks = conf.chunks || [];
                        var assets = Object.keys(dllfiles).filter(function (name) {
                            return chunks.indexOf(name) > -1;
                        }).map(function (name) {
                            var file = dllfiles[name][0];
                            return file;
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
                            plugins.push(new HtmlWebpackIncludeAssetsPlugin({
                                assets: assets,
                                files : files,
                                append: false, 
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
        return this.config;      
    }
}


module.exports = ProjectFactory;

