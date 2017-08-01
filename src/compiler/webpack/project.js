
var _ = require("lodash");
var path = require("path");
var webpack = require("webpack");
var merge = require("webpack-merge");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
var os = require("os");
var HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
var ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');



var ConfigFactory = require("./base.js");

class ProjectFactory  extends ConfigFactory {

    constructor(emi_config, basedir, env, isServer) {
        super(emi_config, basedir, env);
        this.isServer = isServer;
    }

    entryHandle () {
        var config = this.config;
        if (this.isServer) {
            var entry = config.entry;
            Object.keys(entry).forEach(function (name) {
                entry[name] = [path.join(__emi__.root, "./src/client/dev-client.js")].concat(entry[name]);
            });
        } 
        return this;
    }

    outHandle() {
        var output = Object.assign({} ,this.emi_config.output);
        if (!output.path) {
            output.path = this.outpath; 
        }
        if (!output.filename) {
            output.filename = this._join(this._prefixPath(), this._filename());
        }
        if (!output.publicPath) {
            output.publicPath = this._publicPath();
        }
        this.config.output  = output;
        return this;
    }

    _filename() {
        if (this.env === "dev") {
            return "scripts/[name].js";
        } else {
            return "scripts/[name].[chunkhash].js";
        }
    }

    resolveHandle() {
        var resolve = this.config.resolve;
        var modules = resolve.modules || [];
        var cmd_nodepath = path.join(__emi__.root, "node_modules");
        var pro_nodepath = path.join(this.basedir, "node_modules");
        if (!~modules.indexOf(pro_nodepath)) {
            modules.push(pro_nodepath);
        } 

        if (!~modules.indexOf(cmd_nodepath)) {
            modules.push(cmd_nodepath);
        } 
        resolve.modules = modules;
        return this;
    }

    resolveLoadersHandle () {

        var resolveLoader = this.config.resolveLoader;
        var modules = resolveLoader.modules || [];
        var alias = resolveLoader.alias || {};
        var cmd_nodepath = path.join(__emi__.root, "node_modules");
        var pro_nodepath = path.join(this.basedir, "node_modules");
        modules.splice(0,0, cmd_nodepath);
        modules.splice(0,0, pro_nodepath);

        alias.sass = "sass-loader";
        resolveLoader.modules = modules;
        resolveLoader.alias = alias;

        return this;

    }
    cssLoaderHandle() {
        var emiConfig = this.emi_config,
            module = this.config.module,
            rules = module.rules || [],
            plugins = this.config.plugins;

        var me = this;
        var options = _defOptions(emiConfig.cssLoader || {}, this.env);
        options.sourceMap = this._isDev() ? false : true;
        var loaders = this._cssLoader(options, this.env);
        var exts = options.extension;
        var fn = function () {}
        if (options.happypack) {
            //add Css  happayPack loader
            /**
            if (~exts.indexOf("postcss")) {
                exts = exts.concat("postcss");
            }
            **/
            var key_map = {
                "sass" : "sass",
                "scss" : "sass",
                "css" : "css",
                "less" : "less",
                "postcss" : "postcss",
                "styl" : "stylus",
                "stylus" : "stylus"
            }
            fn = function (key) {
                var loaders = [{
                    loader:  'css-loader',
                    options: {
                        minimize: !me._isDev(),
                        sourceMap: options.sourceMap
                    }
                }];
                if (key !== "css") {
                    var loaderOptions = options[key];
                    if (key === "sass") {
                        loaderOptions = Object.assign({ indentedSyntax: true }, options.sass);
                    } else if (key ==="scss") {
                        loaderOptions = Object.assign({}, options.sass);
                    }
                    if (key !== "postcss" ) {
                        loaders.push({
                            loader: "postcss-loader",
                            options: Object.assign({}, {
                                sourceMap: options.sourceMap
                            })
                        });
                    }
                    loaders.push({
                        loader: key_map[key]+"-loader",
                        options: Object.assign({}, loaderOptions , {
                            sourceMap: options.sourceMap
                        })
                    });
                    

                } else {
                     loaders.push({
                        loader: "postcss-loader",
                        options: Object.assign({}, options.postcss, {
                            sourceMap: options.sourceMap
                        })
                    });
                }

                plugins.push(new HappyPack({
                    id : key,
                    threadPool : happyThreadPool,
                    //cache : true,
                    loaders :loaders       
                }));
            }
        } 

        var cssLoaders = exts.map(function (ext) {
            if (~ext.indexOf(".")) {
                ext = ext.split(".")[1];
            }
            fn(ext);
            return {
                test: new RegExp('\\.' + ext + '$'),
                use: loaders[ext] 
            }
        });
        var filename = !this._isDev() ? "styles/[name].[contenthash].css" : "styles/[name].css";

        if (options.extract) {
            plugins.push(new ExtractTextPlugin({
                filename : this._join(this._prefixPath(), filename)
            }));
        }
        module.rules = rules.concat(cssLoaders);
        return this;
    }
    //copy from vue-cli
    _cssLoader(options, env) {

        options = options || {}

        var cssLoader = {
            loader:  'css-loader',
            options: {
                minimize: env == "prd",
                sourceMap: options.sourceMap
            }
        }
        // generate loader string to be used with extract text plugin
        function generateLoaders (id, loader, loaderOptions) {
            var loaders = [cssLoader]
            var fallback = options.vue ? 'vue-style-loader' : 'style-loader'
            if (loader) {
                if (options.happypack) {
                    loaders = ["happypack/loader?id="+id];
                } else {
                    if (id !=="postcss") {
                        loaders.push({
                            loader: "postcss-loader",
                            options: Object.assign({}, options.postcss, {
                                sourceMap: options.sourceMap
                            })
                        });
                    }
                    loaders.push({
                        loader: loader,
                        options: Object.assign({}, loaderOptions, {
                            sourceMap: options.sourceMap
                        })
                    });
                }
            }
            // Extract CSS when that option is specified
            // (which is the case during production build)
            //如果是vue 项目 fallback 使用vue-loader
            if (options.extract) {
                return ExtractTextPlugin.extract({
                    use: loaders,
                    fallback: fallback
                });
            } else {
                return [fallback].concat(loaders)
            }
        }

        // https://vue-loader.vuejs.org/en/configurations/extract-css.html
        return {
            css: generateLoaders("css"),
            postcss: generateLoaders("postcss","postcss", options.postcss),
            less: generateLoaders('less','less'),
            sass: generateLoaders('sass','sass', Object.assign({ indentedSyntax: true }, options.sass)),
            scss: generateLoaders('scss','sass', Object.assign({}, options.sass)),
            stylus: generateLoaders('stylus','stylus'),
            styl: generateLoaders('styl','stylus')
        }


    }
    pluginHandle() {
        var emiConfig = this.emi_config;
        var plugins = this.config.plugins;
        if (this._isDev())  {
            plugins.push(new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('development')
                }
            }));
            plugins.push(new ManifestPlugin());
            if (!this.isServer) {
                copyStatic();    
            } else {
                plugins.push(new webpack.HotModuleReplacementPlugin());
            }
            plugins.push(new FriendlyErrorsPlugin());
        } else {
            plugins.push(new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            }));
            /**
            plugins.push(new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                //sourceMap: true
            }));
             **/
            plugins.push(new ParallelUglifyPlugin({
                cacheDir: '.cache/',
                uglifyJS:{
                    output: {
                        comments: false
                    },
                    compress: {
                        warnings: false
                    },
                    sourceMap : true
                }
            })),
            copyStatic();    
            plugins.push(new ManifestPlugin());
            if (emiConfig.optimizeCss) {
                plugins.push(new OptimizeCSSPlugin(emiConfig.optimizeCss));
            }
            plugins.push(new FriendlyErrorsPlugin());
        }
        function copyStatic() {
            if (emiConfig.staticPath) {
                plugins.push(
                    new CopyWebpackPlugin([
                        {
                            from: path.join(__emi__.cwd, emiConfig.staticPath),
                            to : emiConfig.staticPath,
                            ignore: ['.*']
                        }
                    ])
                )
            }
        }
        return this;
    }
    dllHandle() {
        if (this.emi_config.library) {
            var dll = Object.keys(this.emi_config.library)[0]
            var outpath = this.outpath;
            var plugins = this.config.plugins;
            plugins.push(new webpack.DllReferencePlugin({
                context: this.basedir,
                manifest : this._getDllMainfest(path.join(outpath, "/dll/"+dll+"-manifest.json"))
            }))
        }
        return this;
    }
    otherHandle() {
        if (this._isDev() && !this.config.devtool) {
            this.config.devtool = "#cheap-module-eval-source-map";
        }
        return this;
    
    }
    _getDllMainfest(filepath) {
        var fs = __emi__.fs;
        var content = fs.readFileSync(filepath).toString();
        return JSON.parse(content);
    }
    _getDllFileJson(options) {
        var fs = __emi__.fs;
        var content = fs.readFileSync(path.join(options.path, "./dll/files.json"));
        var ctJson = JSON.parse(content);
        log.detail("DLL JSON CONTENT:", ctJson);
        return ctJson;
    }

    insertHtml() {
        var emiConfig = this.emi_config;
        var plugins = this.config.plugins;
        if (emiConfig.htmlMode !== "replace") {
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
                emiConfig.entryHtml.forEach(function (conf) {
                    var a = Object.assign({},_conf, conf);
                    plugins.push(new HtmlWebpackPlugin(a));
                });
                //append dll resource 
                if (emiConfig.library) {
                    var dllfiles = this._getDllFileJson({path : this.outpath});
                    var assets = Object.keys(dllfiles).map(function (key) {
                        var file = dllfiles[key][0]
                        return file;
                    });
                    plugins.push(new HtmlWebpackIncludeAssetsPlugin({
                        assets: assets,
                        append: false, 
                    })) 
                }
            }
        } 
        //替换版本号
        else {

        }
        return this;
    }



    getConfig () {
        this.entryHandle()
            .outHandle()
            .resolveHandle()
            .resolveLoadersHandle()
            .cssLoaderHandle()
            .dllHandle()
            .pluginHandle()
            .insertHtml()
            .otherHandle()
        return this.config;      
    }
}

function _defOptions(options, env)  {
    if (typeof options.extract === "undefined") {
        options.extract = true; 
    }
    if (typeof options.extension === "undefined") {
        options.extension = ["css", "scss", "sass"]; 
    }
    /** 
     * default use project path postcss.config.js
    if (typeof options.postcss === "undefined") {
        options.postcss = {
            plugins : function () {
                return [
                    require("autoprefixer")()
                ]
            }  
        }; 
    }
     **/
    if (typeof options.happypack === "undefined") {
        options.happypack = true; 
    }
    return options;
}

module.exports = ProjectFactory;
var cssLoader = ProjectFactory.prototype._cssLoader;
module.exports.cssLoader = function (options, env) {
    if (!options) {
        options =  _defOptions({}, env);
    }
    return cssLoader(options, env);
}
