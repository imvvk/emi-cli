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
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')


var OUTPUT =  {"dev": "dev", "prd" : "dist"};

module.exports = {

    hasDll : hasDll,

    getDllConfig : function (basedir, config, env) {
        if (env === "prd") {
            return dllprd(basedir, config);
        } else {
            return dlldev(basedir, config);
        }
    },
    getConfig : function (basedir, config, env) {
        if (env === "prd")  {
            return prd(basedir, config);
        } else {
            return dev(basedir, config);
        }
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

function _outpath(basedir, env) {
    var outpath = path.join(basedir, OUTPUT.dev);
    return outpath;
}

function hasDll(config) {
    return config.library && !_.isEmpty(config.library);
};

function dlldev(basedir, config) {
    var library = config.library;
    var outpath = path.join(basedir, OUTPUT.dev);
    var dll = {
        context : basedir,
        entry : library,
        output : {
            path : outpath, 
            filename : "[name].js",
            library: "__lib__[name]__"
        },
        plugins: [
            new webpack.DllPlugin({
                path: path.join(outpath, "/dll/[name]-manifest.json"),
                name: "__lib__[name]__",
                context: basedir
            }),
            new webpack.optimize.DedupePlugin(),
            _dllInfoTofile({path : outpath })
            //dllInfoTofile({path : path.join(outpath, "./dll")})
        ]
    }
    return dll;
}



function dllprd(basedir, config) {
    var outpath = path.join(basedir, OUTPUT.prd);
    var dll = {
        context : basedir,
        entry : library,
        output : {
            path : outpath, 
            filname : "[name].js",
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
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                test: /(\.jsx?)$/,
                compress: {
                    warnings: false,
                    drop_console: true,
                    drop_debugger: true
                }
            }),
            _dllInfoTofile({path : outpath })
        ]
    }
    return dll;
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
            console.log("write dll files info to :", fp);
            callback();
        });
    }
}

function _getDllFileJson(options) {
    var fs = __emi__.fs;
    var content = fs.readFileSync(path.join(options.path, "./dll/files.json"));
    var ctJson = JSON.parse(content);
    console.log("ctJson", ctJson);
    return ctJson;

}


//简单解析用户config 为dev prd 使用

function _resolve(config, basedir) {

    var wpconf = Object.assign({}, config); 
    delete wpconf.library;
    delete wpconf.entryHtml;
    delete wpconf.htmlMode;
    delete wpconf.cssLoader;
    delete wpconf.publicPath;
    delete wpconf.staticPath;
    delete wpconf.proxy;

    wpconf.context = basedir;
    wpconf.plugins = wpconf.plugins || [];
    wpconf.module = wpconf.module || {};
    wpconf.resolve = wpconf.resolve || {};
    wpconf.resolveLoader = wpconf.resolveLoader || {};

    wpconf.stats = "errors-only" 
    return wpconf;

}


function dev(basedir, config) {
    var wpconf = _resolve(config, basedir);
    var plugins = wpconf.plugins;
    var module = wpconf.module;
    var resolve = wpconf.resolve;
    var outpath = path.join(basedir, OUTPUT.dev);
    var tmp;
    //必须设置为自己的path 解析依赖
    wpconf.output = _.merge({
        publicPath : config.publicPath || "/",
        filename : "[name].js" 
    }, config.output || {}, {
        path : outpath,
    });

    wpconf.devtool = wpconf.devtool || "#cheap-module-eval-source-map";

    plugins.push(new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('development')
        }
    }));

    
    _insertDll(plugins, basedir, config, "dev");
    _insertHtml(plugins, basedir,config, "dev");
    _mergeLoaders(module, basedir, config, plugins, "dev");
    _mergeResolveLoaders(wpconf.resolveLoader, basedir, config, "dev" );
     

    plugins.push(new webpack.HotModuleReplacementPlugin());
    plugins.push(new webpack.NoEmitOnErrorsPlugin());
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
    wpconf.output = _.merge({
        publicPath : config.publicPath || "/",
        filename : "[name].[chunkhash8].js" 
    }, config.output || {}, {
        path : outpath
    });
    plugins.push(new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    }));
    var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
    _insertDll(plugins, basedir, config, "prd");
    _insertHtml(plugins, basedir,config, "prd");
    _mergeLoaders(module, basedir, config, plugins, "prd");
    _mergeResolveLoaders(wpconf.resolveLoader, basedir, config, "prd" );

    plugins.push(new webpack.NoEmitOnErrorsPlugin());
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

    if (options.extract) {
        plugins.push(new ExtractTextPlugin({
            filename : "[name].css"
        }));
    }

    function _defOptions(options)  {
        if (typeof options.extract === "undefined") {
            options.extract = true; 
        }
        if (typeof options.extension === "undefined") {
            options.extension = ["css", "scss"]; 
        }
        return options;
    }
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
    function generateLoaders (loader, loaderOptions) {
        var loaders = [cssLoader]
        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: Object.assign({}, loaderOptions, {
                    sourceMap: options.sourceMap
                })
            })
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

function _mergeResolveLoaders(resolveLoaders, basedir, config, env) {
    var modules = resolveLoaders.modules || [];
    var cmd_nodepath = path.join(__emi__.root, "node_modules");
    var pro_nodepath = path.join(basedir, "node_modules");
    modules.splice(0,0, cmd_nodepath);
    modules.splice(0,0, pro_nodepath);
    resolveLoaders.modules = modules;
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

function _getDllMainfest(filepath) {
    var fs = __emi__.fs;
    var content = fs.readFileSync(filepath).toString();
    return JSON.parse(content);
}

function _insertHtml(plugins, basedir, config, env) {

    if (config.htmlMode === "inject") {
        if (config.entryHtml && config.entryHtml.length) {
            config.entryHtml.forEach(function (conf) {
                plugins.push(new HtmlWebpackPlugin(conf));
            });
            //append dll resource 
            if (hasDll(config)) {
                var dllfiles = _getDllFileJson({path : _outpath(basedir, env)});
                var assets = Object.keys(dllfiles).map(function (key) {
                    var file = dllfiles[key][0]
                    return file;
                });
                console.log("====", assets);
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


