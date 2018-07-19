/**
* @file cssLoader.js
* @brief 根据emi.config.js 中的 cssLoader 生成 样式loaders 并默认加入 thread-loader cache-loader (env: production)
* @author imvvk
* @version 
* @date 2018-07-03
*/

const _ = require('lodash');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const miniCssLoader = MiniCssExtractPlugin.loader;

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
      //minimize: false
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
     //minimize: true  // use optimizeCssPlugin do in webpack 4
    },
    sass :  {
      indentedSyntax : true
    },
    scss : {},
    less : {},
    stylus : {},
    postcss : {}
}





/**
 * 生成样式loaders 
 *
 * @param {Object} options emi.config cssLoader
 * @param {String } env dev or prd
 * @returns {Array} loaders
 */
const createCssLoader = (options, env) => {
  options = options || {};
  if (!env) {
    env = process.env.NODE_ENV === 'production' ? 'prd' : 'dev';
  }
  
  if (env === 'prd') {
    return createPrdLoaders(options); 
  } else if (options.packCss) {
    return createPackLoaders(options);
  } else {
    return createDevLoaders(options);
  }

}

const createPrdLoaders = (options) => {
  let loaderObjs = {};
  let extensions = getExtensions(options);
  extensions.forEach(generateLoaders(loaderObjs, options, PRD_DEFAULT_CONFIG, false));

  var styleLoader = miniCssLoader;

  var loaders = extensions.map(createLoaderObj(styleLoader, loaderObjs));

  return loaders; 
}

const createDevLoaders = (options) => {
  let loaderObjs = {};
  
  let extensions = getExtensions(options);

  extensions.forEach(generateLoaders(loaderObjs, options, DEV_DEFAULT_CONFIG, true));
  
  var styleLoader = options.vue ? "vue-style-loader" : "style-loader";

  var loaders = extensions.map(createLoaderObj(styleLoader, loaderObjs));

  return loaders;
}


const createPackLoaders = (options) => {
  
  let loaderObjs = {};

  let extensions = getExtensions(options);

  extensions.forEach(generateLoaders(loaderObjs, options, DEV_DEFAULT_CONFIG, true));

  var styleLoader = miniCssLoader;

  var loaders = extensions.map(createLoaderObj(styleLoader, loaderObjs));

  return loaders;
}

const generateLoaders = (rs, options, defConfig, sourceMap) => (ext) => {
    var key = CSS_KEY[ext];
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
      var def_config =  defConfig[key] || {}; 
      loaders.push({
        loader : key + '-loader',
        options : Object.assign({},
          def_config,
          { sourceMap : sourceMap },
          parseOutLoaderOpts(key, options)
        )
      });
    }
    rs[key] = loaders;
}

const createLoaderObj = (styleLoader, loaderObjs) => (ext) => {
  var key = CSS_KEY[ext];
  var loaders = loaderObjs[key];
  loaders.splice(0, 0, styleLoader);

  return {
    test: new RegExp('\\.' + ext + '$'),
    use: loaders
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



module.exports = createCssLoader;

module.exports.cssLoader = function (options) {
    return {};
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


