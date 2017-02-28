/**
 * config utils 将配置文件转化为 webpack 配置文件
 * @author imvvk 
 */
var _ = require("lodash");
var path = require('path');
var webpack = require("webpack");
var merge = require("webpack-merge");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var ManifestPlugin = require('webpack-manifest-plugin');
 




var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')


var OUTPUT =  {"dev": "dev", "prd" : "dist"};
var WebpackConfigKeys = [ "amd", "bail", "cache", "context", "dependencies", "devServer", "devtool", "entry", "externals", "loader", "module", "name", "node", "output", "performance", "plugins", "profile", "recordsInputPath", "recordsOutputPath", "recordsPath", "resolve", "resolveLoader", "stats", "target", "watch", "watchOptions"]

module.exports = {

    hasDll : hasDll,

    pulicPath : _publicPath,
    assetsPath : _assetsPath,
    cssLoader : _cssLoader,
    outpath : _outpath,

    getDllConfig : function (basedir, config, env) {
        var dllConfig;
        if (env === "prd") {
            dllConfig = dllprd(basedir, config);
        } else {
            dllConfig = dlldev(basedir, config);
        }
        
        program.detail && console.log("dllConfig is:")
        program.detail && console.log(dllConfig);
        return dllConfig;
    },
    getConfig : function (basedir, config, env, isServer) {
        var webpackConfig;
        if (env === "prd")  {
            webpackConfig = prd(basedir, config);
        } else {
            webpackConfig = dev(basedir, config, isServer);
        }
        program.detail && console.log("webpackConfig is:")
        program.detail && console.log(webpackConfig);
        return webpackConfig;
    },
    logStats : function (stats, showWarn) {
        var info;
        if (showWarn && stats.hasWarnings()) {
            info = stats.toJson();
            info.warnings.forEach(function (warn) {
                log.warn(warn);
            })
        }
        if (stats.hasErrors()) {
            info = stats.toJson();
            info.errors.forEach(function (err) {
                log.error(err);
            }) 
        }
    
    }


}


function dlldev(basedir, config) {
    var library = config.library;
    var outpath = path.join(basedir, OUTPUT.dev);
    var dll = {
        context : basedir,
        entry : library,
        output : {
            path : outpath, 
            filename : _assetsPath(config.pathMap, "dev", "[name].js"),
            library: "__lib__[name]__"
        },
        plugins: [
            new webpack.DllPlugin({
                path: path.join(outpath, "/dll/[name]-manifest.json"),
                name: "__lib__[name]__",
                context: basedir
            }),
            _dllInfoTofile({path : outpath })
            //dllInfoTofile({path : path.join(outpath, "./dll")})
        ]
    }
    dll.resolve = config.resolve || {};
    _mergeResolve(dll.resolve, basedir, config, "dev");
    return dll;
}



function dllprd(basedir, config) {
    var library = config.library;
    var outpath = path.join(basedir, OUTPUT.prd);
    var dll = {
        context : basedir,
        entry : library,
        output : {
            path : outpath, 
            filename : _assetsPath(config.pathMap, "prd", "[name][chunkhash].js"),
            publicPath : _publicPath(config.pathMap, "prd"),
            library: "__lib__[name]__"
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            new webpack.DllPlugin({
                path: path.join(outpath, "/dll/[name]-manifest.json"),
                name: "__lib__[name]__",
                context: basedir
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            }),
            _dllInfoTofile({path : outpath })
        ]
    }
    dll.resolve = config.resolve || {};
    _mergeResolve(dll.resolve, basedir, config, "dev");
    return dll;
}






function dev(basedir, config, isServer) {
    var wpconf = _resolve(config, basedir);
    var plugins = wpconf.plugins;
    var module = wpconf.module;
    var resolve = wpconf.resolve;
    var outpath = path.join(basedir, OUTPUT.dev);
    var tmp;
    //必须设置为自己的path 解析依赖
    wpconf.output = {
        path : _outpath(basedir, "dev"), 
        publicPath : _publicPath(config.pathMap, 'dev'),
        filename : _assetsPath(config.pathMap , 'dev',"scripts/[name].js")
    };

    wpconf.devtool = "#cheap-module-eval-source-map";

    plugins.push(new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('development')
        }
    }));

    
    _insertDll(plugins, basedir, config, "dev");
    _insertHtml(plugins, basedir,config, "dev");
    _mergeLoaders(module, basedir, config, plugins, "dev");
    _mergeResolve(wpconf.resolve, basedir, config, "dev");
    _mergeResolveLoaders(wpconf.resolveLoader, basedir, config, "dev" );
    if (!isServer) {
        plugins.push(new ManifestPlugin());
        if (config.staticPath) {
            plugins.push(
                new CopyWebpackPlugin([
                    { 
                        from: path.join(__emi__.cwd, config.staticPath),
                        to : config.staticPath,
                        ignore: ['.*']
                    }
                ])
            )
        }
    } else {
        plugins.push(new webpack.HotModuleReplacementPlugin());
    }
    plugins.push(new FriendlyErrorsPlugin());

    return wpconf;
}

function prd(basedir, config){
    
    var wpconf = _resolve(config, basedir);
    var plugins = wpconf.plugins;
    var module = wpconf.module;
    var resolve = wpconf.resolve;
    var outpath = path.join(basedir, OUTPUT.prd);
    var tmp;
    wpconf.output = {
        path : _outpath(basedir, "prd"), 
        publicPath : _publicPath(config.pathMap, "prd"),
        filename : _assetsPath(config.pathMap , 'prd', "scripts/[name].[chunkhash].js"),
        chunkFilename: _assetsPath(config.pathMap , 'prd', 'scripts/[id].[chunkhash].js')
    };
    _mergeResolve(wpconf.resolve, basedir, config, "prd");
    _mergeResolveLoaders(wpconf.resolveLoader, basedir, config, "prd" );
    plugins.push(new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    }));
    _insertDll(plugins, basedir, config, "prd");
    
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        sourceMap: true
    }));
    _mergeLoaders(module, basedir, config, plugins, "prd");
    _insertHtml(plugins, basedir,config, "prd");

    if (config.staticPath) {
        plugins.push(
            new CopyWebpackPlugin([
                {
                    from: path.join(__emi__.cwd, config.staticPath),
                    to : config.staticPath,
                    ignore: ['.*']
                }
            ])
        )
    }

    plugins.push(new ManifestPlugin());
    plugins.push(new OptimizeCSSPlugin());
    plugins.push(new FriendlyErrorsPlugin());
    return wpconf;
}

function _mergeLoaders(module, basedir, config, plugins, env) {
    var rules = module.rules || [];
    var options = _defOptions(config.cssLoader || {});
    
    var loaders = _cssLoader(options, env);

    var cssLoader = options.extension.map(function (ext) {
        if (~ext.indexOf(".")) {
            ext = ext.split(".")[1];
        }
        return {
            test: new RegExp('\\.' + ext + '$'),
            use: loaders[ext] 
        } 
    }).filter(function (conf) {
        return  conf;
    });

    module.rules = rules.concat(cssLoader);
    var filename = env === "prd" ? "styles/[name].[contenthash].css" : "styles/[name].css";

    if (options.extract) {
        plugins.push(new ExtractTextPlugin({
            filename : _assetsPath(config.pathMap, env, filename)
        }));
    }

    function _defOptions(options)  {
        if (typeof options.extract === "undefined") {
            options.extract = true; 
        }
        if (typeof options.extension === "undefined") {
            options.extension = ["css", "scss", "sass"]; 
        }
        return options;
    }
}


function _mergeResolveLoaders(resolveLoaders, basedir, config, env) {
    var modules = resolveLoaders.modules || [];
    var alias = resolveLoaders.alias || {};
    var cmd_nodepath = path.join(__emi__.root, "node_modules");
    var pro_nodepath = path.join(basedir, "node_modules");
    modules.splice(0,0, cmd_nodepath);
    modules.splice(0,0, pro_nodepath);

    alias.sass = "sass-loader";
    resolveLoaders.modules = modules;
    resolveLoaders.alias = alias;
}

function _mergeResolve(resolve, basedir, config, env) {
    var modules = resolve.modules || [];
    if (modules.length) {
        var cmd_nodepath = path.join(__emi__.root, "node_modules");
        var pro_nodepath = path.join(basedir, "node_modules");
        modules.splice(0,0, cmd_nodepath);
        if (!~modules.indexOf(pro_nodepath)) {
            modules.splice(0,0, pro_nodepath);
        }
        resolve.modules = modules;
    }
}


function _insertDll(plugins, basedir, config, env) {
     if (hasDll(config)) {
        var dll = Object.keys(config.library)[0]
        var outpath = path.join(basedir, OUTPUT[env]);
        plugins.push(new webpack.DllReferencePlugin({
            context: basedir,
            //manifest: require(path.join(outpath, "/dll/"+dll+"-manifest.json"))
            manifest : _getDllMainfest(path.join(outpath, "/dll/"+dll+"-manifest.json"))
        }))
    }
}

function _insertHtml(plugins, basedir, config, env) {

    if (config.htmlMode === "inject") {
        if (config.entryHtml && config.entryHtml.length) {
            var _conf = env === "prd" ? {
                inject : true , 
                chunksSortMode: 'dependency',
                minify: {
                    minifyCSS : true,
                    minifyJS : true,
                    removeComments: true,
                    collapseWhitespace: true
                }
            } : {inject: true,   chunksSortMode: 'dependency'};
            config.entryHtml.forEach(function (conf) {
                var a = _.assign({},_conf, conf);
                plugins.push(new HtmlWebpackPlugin(a));
            });
            //append dll resource 
            if (hasDll(config)) {
                var dllfiles = _getDllFileJson({path : _outpath(basedir, env)});
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
    else if (config.htmlMode === "replace") {
            
    }
}

//工具函数==================
//
//

//简单解析用户config 为dev prd 使用

function _resolve(config, basedir) {
    var wpconf = {}; 
    Object.keys(config).forEach(function (key) {
        if (~WebpackConfigKeys.indexOf(key)) {
            wpconf[key] = config[key]       
        }
    })

    wpconf.context = basedir;
    wpconf.plugins = wpconf.plugins || [];
    wpconf.module = wpconf.module || {};
    wpconf.resolve = wpconf.resolve || {};
    wpconf.resolveLoader = wpconf.resolveLoader || {};

    wpconf.stats = wpconf.stats || "verbose";
    return wpconf;

}

function _dllInfoTofile(options) {
    var fs = __emi__.fs;
    return function () {
        this.plugin("emit", function (compilation, callback) {
            var chunks = compilation.namedChunks;
            var dll_files_info = {};
            Object.keys(chunks).forEach(function (name) {
                dll_files_info[name] = chunks[name].files;
            });
            var fp = path.join(options.path, "./dll/files.json");
            fs.writeFileSync(fp, JSON.stringify(dll_files_info));
            log.debug("write dll files info to :", fp);
            callback();
        });
    }
}

function _getDllFileJson(options) {
    var fs = __emi__.fs;
    var content = fs.readFileSync(path.join(options.path, "./dll/files.json"));
    var ctJson = JSON.parse(content);
    log.detail("DLL JSON CONTENT:", ctJson);
    return ctJson;
}


function _outpath(basedir, env) {
    var outpath = path.join(basedir, OUTPUT[env]);
    return outpath;
}

function hasDll(config) {
    return config.library && !_.isEmpty(config.library);
};

function _getDllMainfest(filepath) {
    var fs = __emi__.fs;
    var content = fs.readFileSync(filepath).toString();
    return JSON.parse(content);
}

function _publicPath(pathMap, env) {
    if (!(pathMap && pathMap[env])) {
        return ""; 
    }
    return pathMap[env].publicPath || "";
}


function _assetsPath(pathMap, env, filename) {
    if (!(pathMap && pathMap[env])) {
        return  filename; 
    }
    return path.posix.join(pathMap[env].assetsPath || "",  filename);
}

function _cssLoader (options, env) {
    
    options = options || {}
    if (env !== "prd") {
        options.sourceMap = true; 
    }

    var cssLoader = {
        loader: 'css-loader',
        options: {
            minimize: env == "prd",
            sourceMap: options.sourceMap
        }
    }
    var fallback_loader = options.vue ? "vue-style-loader" : "style-loader";
    // generate loader string to be used with extract text plugin
    function mergeOpts(loader, loaderOptions) {
        var _opts ;
        if (loader === "postcss") {
            _opts = loaderOptions || {
                plugins : [
                    require("autoprefixer")({
                        browsers: ['last 2 versions']
                    })
                ]
            };
        } else {
            _opts = Object.assign({}, loaderOptions, {
                sourceMap: options.sourceMap
            });
        }
        return {
            loader: loader + '-loader',
            options: _opts
        }
    }
    function generateLoaders (loader, loaderOptions) {
        var loaders = [cssLoader]
        if (loader !== "postcss") {
            loaders.push(mergeOpts("postcss",  options.postcss));
        }
        if (loader) {
            loaders.push(mergeOpts(loader, loaderOptions));
        }
        // Extract CSS when that option is specified
        // (which is the case during production build)
        if (options.extract) {
            return ExtractTextPlugin.extract({
                use: loaders,
                fallback: fallback_loader
            });
        } else {
            return [ fallback_loader ].concat(loaders)
        }
    }

    // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
    return {
        css: generateLoaders(),
        postcss: generateLoaders("postcss", options.postcss),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', Object.assign({ indentedSyntax: true }, options.sass)),
        scss: generateLoaders('sass', Object.assign({}, options.sass)),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    }
}


