/**
 * @file cssLoaders.js
 * @brief 样式Loader 解析工具 解析配置文件中的 cssLoader 配置
 * @author 
 * @version 
 * @date 2017-10-16
 */

const _ = require('lodash');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const CSS_KEY = {
    "sass" : "sass",
    "scss" : "scss",
    "css" : "css",
    "less" : "less",
    "styl" : "stylus",
    "stylus" : "stylus"
};


const DEV_DEFAULT_CONFIG = {
    css : {
        minimize: false
    },
    sass :  {
        indentedSyntax : true
    },
    scss : {},
    less : {},
    stylus : {},
    postcss : {}
}

const PRD_DEFAULT_CONFIG = {
    css : {
        minimize: true 
    },
    sass :  {
        indentedSyntax : true 
    },
    scss : {},
    less : {},
    stylus : {},
    postcss : {}
}



module.exports = createCssLoader;

module.exports.cssLoader = function (options) {
    var loaders = createCssLoader(options);
    var obj = {};
    loaders.forEach(function (data) {
        var key = data.test.toString().replace(/\/\\\.(\w+)\$\//, function (m, n) { 
            return n;
        });
        obj[key] = data.use 
    })
    return obj; 
}

module.exports.createHappypackLoaders = function (options, env) {
    var sourceMap , defConfig;
    var opts = Object.assign({}, options, {happypack : false});
    if (env === 'prd') {
        sourceMap = false;
        defConfig = PRD_DEFAULT_CONFIG;
    } else {
        sourceMap = true;
        defConfig = DEV_DEFAULT_CONFIG;
    }

    return generateLoaders(opts, defConfig, sourceMap);

}

function generateLoaders(options, defConfig, sourceMap) {
    var extensions = getExtensions(options);
    var rs = {};
    extensions.forEach(function (ext) {
        var key = CSS_KEY[ext];
        if (options.happypack) {
            rs[key] = ['happypack/loader?id=' + key ];
        } else {
            var cssLoader = {
                loader: 'css-loader',
                options: Object.assign(
                    {}, 
                    defConfig.css,
                    {sourceMap : sourceMap},
                    parseOutLoaderOpts('css', options)
                )
            }

            var postCssLoader = {
                loader: 'postcss-loader',
                options: Object.assign(
                    {}, 
                    defConfig.postcss,
                    {sourceMap : sourceMap},
                    parseOutLoaderOpts('postcss', options)
                )
            }

            var loaders = [cssLoader, postCssLoader];

            if(ext !== 'css') {
                loaders.push({
                    loader : key + '-loader',
                    options : Object.assign({},
                        defConfig[key],
                        { sourceMap : sourceMap },
                        parseOutLoaderOpts(key, options)
                    )
                });
            }
            rs[key] = loaders;
        }
    });
    return rs;
}


function createCssLoader(options, env) {

    if (!env) {
        env = process.env.NODE_ENV === 'production' ? 'prd' : 'dev';
    }
    
    options = options || {};

    if (env === 'prd') {
        return createPrdLoaders(options); 
    } else if (options.packCss) {
        return createPackLoaders(options);
    } else {
        return createDevLoaders(options);
    }

}



function getExtensions(options) {
    var exts = options.extension || ["css", "scss", "sass"];
    exts = exts.map(function (ext) {
        if (~ext.indexOf(".")) {
            ext = ext.split(".")[1];
        } 
        return ext;
    }).filter(function (ext) {
        var key = CSS_KEY[ext];
        if (!key || key === 'postcss') {
            return; 
        }
        return true;
    });
    return exts;
}


function createDevLoaders(options) {
    var extensions = getExtensions(options);
    var sourceMap = true;
    var loaders = generateLoaders(options, DEV_DEFAULT_CONFIG, sourceMap);

    var fallback = options.fallback || (options.vue ? "vue-style-loader" : "style-loader")
    
    loaders = extensions.map(function (ext) {
        var key = CSS_KEY[ext];
        var loader = loaders[key];
        loader.splice(0, 0, fallback);
        return {
            test: new RegExp('\\.' + ext + '$'),
            use: loader
        } 
    });

    return loaders;

}


function createPrdLoaders(options) {
    var extensions = getExtensions(options);
    var sourceMap = false;
    var loaders = generateLoaders(options, PRD_DEFAULT_CONFIG, sourceMap);

    var fallback = options.fallback || (options.vue ? "vue-style-loader" : "style-loader")
    
    loaders = extensions.map(function (ext) {
        var key = CSS_KEY[ext];
        var loader = loaders[key];

        return {
            test: new RegExp('\\.' + ext + '$'),
            use: ExtractTextPlugin.extract({
                use: loader,
                fallback: fallback
            })
        } 
    });
    return loaders;
}


function createPackLoaders(options) {
    var extensions = getExtensions(options);
    var sourceMap = true;
    var loaders = generateLoaders(options, DEV_DEFAULT_CONFIG, sourceMap);

    var fallback = options.fallback || (options.vue ? "vue-style-loader" : "style-loader")
    
    loaders = extensions.map(function (ext) {
        var key = CSS_KEY[ext];
        var loader = loaders[key];

        return {
            test: new RegExp('\\.' + ext + '$'),
            use: ExtractTextPlugin.extract({
                use: loader,
                fallback: fallback
            })
        } 
    });

    return loaders;

}




function parseOutLoaderOpts(key, options) {
    var  data = options[key];
    if (_.isPlainObject(data)) {
        return data; 
    } else if (_.isFunction(data)) {
        var env = process.env.NODE_ENV; 
        return data(env);
    } else {
        return {} 
    }
}

