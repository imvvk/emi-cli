
var webpack = require('webpack')
var path = require('path')
var ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

var CopyWebpackPlugin = require("copy-webpack-plugin");

var os = require("os");
var HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

var cssLoader = require('../../utils/cssLoaders.js');

module.exports = function (outpath, emiConfig) {

    var extractOptions = (emiConfig.cssLoader  || { extract : {}}).extract; 

    var config = {
        devtool : false,
        plugins : [
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
                }
            }),

            new ExtractTextPlugin(Object.assign({
                    filename : 'styles/[name].[contenthash:8].css'
                }, extractOptions ))
         
          
        ]
    }

    if (emiConfig.optimizeCss) {
        //去重CSS 
        var opts = emiConfig.optimizeCss === true ?  {
            cssProcessorOptions: {
                safe: true,
                'z-index' : false,
                discardComments: {
                    removeAll: true,
                },
            }
        } : emiConfig.optimizeCss; 
        config.plugins.push(new OptimizeCSSPlugin(opts));
    }

    //生产环境采用 HashId  但体积会大一些 添加模块不会影响 未改变的
    config.plugins.push(new webpack.HashedModuleIdsPlugin(emiConfig.HashedModuleIds));

    if (emiConfig.cssLoader && emiConfig.cssLoader.happypack) {

        var loaders = cssLoader.createHappypackLoaders(emiConfig.cssLoader, 'dev');

        Object.keys(loaders).forEach(function(key) {
            var _loaders  = loaders[key];
            config.plugins.push(
                new HappyPack({
                    id : key,
                    threadPool : happyThreadPool,
                    loaders :_loaders,
                    //debug : true
                })
            );
        });
    }

    if (Object.keys(emiConfig.entry).length > 1 && emiConfig.commonPack) {
        config.plugins[1] =  new ExtractTextPlugin({
            filename : 'styles/[name].[contenthash:8].css',
            allChunks : true
        });

        config.plugins.push(
            new webpack.optimize.CommonsChunkPlugin({
                name: '__common__',
                chunks : Object.keys(emiConfig.entry) 
            })
        );
    }

    if (emiConfig.minify !== false) {
        /**
        config.plugins.push(new ParallelUglifyPlugin({
            uglifyJS:{
                output: {
                    comments: false
                },
                compress: {
                    warnings: false
                },
                sourceMap : false
            }
        }));
         **/
      config.plugins.push( new UglifyJsPlugin({
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
        })
      )
    }
    if (emiConfig.staticPath) {
        config.plugins.push(
            new CopyWebpackPlugin([
                {
                    from: path.join(__emi__.cwd, emiConfig.staticPath),
                    to : path.join(outpath , emiConfig.staticPath),
                    ignore: ['.*']
                    
                }
            ])
        )
    }

    if (emiConfig.analyze) {
        if (emiConfig.analyze === true) {
            emiConfig.analyze = { analyzerMode :  'static'};
        } 
        var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
        config.plugins.push(new BundleAnalyzerPlugin(emiConfig.analyze))
    }

    return config;

}
    

