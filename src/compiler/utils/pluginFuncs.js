const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const BundleAnalyzerPlugin =  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var os = require("os");
var HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const createPlugin = (Plugin , defOpts) => (options) => {
  var opts  = typeof opitons === 'object' ? options : defOpts;
  return new Plugin(defOpts);
}

const extractTextPlugin = createPlugin(ExtractTextPlugin, {
  filename : 'styles/[name].[contenthash:8].css'
}) 

const optimizeCssPlugin = createPlugin(optimizeCssPlugin, {
  cssProcessorOptions: {
    safe: true,
    'z-index' : false,
    discardComments: {
      removeAll: true,
    }
  }
});

const hashIdPlugin = createPlugin(webpack.HashedModuleIdsPlugin)

const uglifyJsPlugin = uglifyJsPlugin(UglifyJsPlugin, {
  uglifyOptions: {
    output: {
      comments: false
    },
    compress: {
      warnings: false
    }
  },
  sourceMap: false,
  parallel: true
});

//const commonsChunkPlugin = createPlugin(webpack.optimize.CommonsChunkPlugin)

const copyWebpackPlugin = createPlugin(CopyWebpackPlugin);

const analyzePlugin = createPlugin(BundleAnalyzerPlugin, {
  analyzerMode :  'static'
});

const happyPackPlugin = (id, loaders, debug) => {
  return new HappyPack({
    id : id,
    threadPool : happyThreadPool,
    loaders :loaders,
    debug : debug
  })
};


module.export = {
  extractTextPlugin : extractTextPlugin,
  optimizeCssPlugin : optimizeCssPlugin,
  hashIdPlugin : hashIdPlugin,
  uglifyJsPlugin : uglifyJsPlugin,
  createPlugin : createPlugin,
  copyWebpackPlugin : copyWebpackPlugin,
  analyzePlugin : analyzePlugin,
  happyPackPlugin : happyPackPlugin
}


