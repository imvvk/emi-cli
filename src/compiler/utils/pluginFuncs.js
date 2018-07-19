const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const BundleAnalyzerPlugin =  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var os = require("os");
var HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const createPlugin = (Plugin , defOpts) => (options) => {
  var opts  = typeof options === 'object' ? options : defOpts;
  return new Plugin(opts);
}

const extractTextPlugin = createPlugin(MiniCssExtractPlugin, {
  filename : 'styles/[name].[contenthash].css', 
  chunkFilename : 'styles/[id].[contenthash].css'

}) 

const optimizeCssPlugin = createPlugin(OptimizeCSSPlugin, {
  cssProcessorOptions: {
    safe: true,
    'z-index' : false,
    discardComments: {
      removeAll: true,
    }
  }
});

const hashIdPlugin = createPlugin(webpack.HashedModuleIdsPlugin)

const uglifyJsPlugin = createPlugin(UglifyJsPlugin, {
  uglifyOptions: {
    output: {
      comments: false
    },
    compress: {
      warnings: false
    }
  },
  cache : true,
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


module.exports = {
  extractTextPlugin : extractTextPlugin,
  optimizeCssPlugin : optimizeCssPlugin,
  hashIdPlugin : hashIdPlugin,
  uglifyJsPlugin : uglifyJsPlugin,
  createPlugin : createPlugin,
  copyWebpackPlugin : copyWebpackPlugin,
  analyzePlugin : analyzePlugin,
  happyPackPlugin : happyPackPlugin
}


