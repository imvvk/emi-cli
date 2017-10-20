
var UglifyJSPlugin = require('uglifyjs-webpack-plugin')

var path = require('path');

function resolve (dir) {
  return path.join(__dirname, './', dir)
}

module.exports = {
    library : {
        'vendor' : [
            'vue', 'vue-router', 'vuex', 'element-ui'
        ],
        'utils' : [
            'axios', 'moment'
        ]
    }, 
    entry : {
        index : './src/index.js',
        list : './src/list.js'
    },
    output: {

    },
    //htmlMode : "inject",

    //entryHtml : entryHtml,
    //historyApi : true, //开启HTML5 historyAPI  server 使用 所有的访问都到index.html 下
    //cssLoader : cssLoader,
    /**
     * css Loader 生成器 
  cssLoader : {
    sass : {},
    postcss : {},
    extra : true,
    vue : true  
  },
     **/
    //staticPath : 'static',//不需要转化的静态资源文件 

    //路径配置 
    //prefixPath 会增加到 filename 的前面生成物理路径
    // publicPath 同 output 的 publicPath 虚拟路径 
    pathMap : {
        dev : {
            // prefixPath : "",  //路径前缀 
            publicPath : "/",
        },
        prd : {
            // prefixPath : "aaa",
            publicPath : "./"
        }
    },
    proxyTable: {
        '/v2': {
            // target: 'http://10.231.27.242:9973',
            target: 'http://splus.ad.xiaomi.srv/',
            changeOrigin: true,
            pathRewrite: {
                // '^/html': ''
            }
        },
        '/*.html': {
            target: 'http://localhost:9000/html',
            changeOrigin: true,
            pathRewrite: {

            }
        },
        '/fake': {
            target: 'http://localhost:3000/',
            changeOrigin: true,
            pathRewrite: {
                '^/fake': ''
            }
        }
    },

    resolve: {
        extensions: ['.js', '.vue', '.json'],
        mainFiles : ["index", "index.vue"],
        modules: [
            resolve('src'),
            resolve('node_modules')
        ],
        alias: {
            'vue$': 'vue/dist/vue.common.js',
            'src': resolve('src'),
            'assets': resolve('src/assets'),
            'components': resolve('src/components'),
            'libs': resolve('src/libs'),
            'modules': resolve('src/modules'),
        }
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'happypack/loader?id=babel',
                include: [resolve('src')]
            },
            {
                test: /\.(png|jpe?g|gif|svg|swf)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: 'static/img/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: 'static/fonts/[name].[hash:7].[ext]'
                }
            }
        ]
    },
    plugins : [],

    devConfig() {
    
    },

    prdConfig() {
    
    
    },
    devDllConfig() {
    
    },

    prdDllConfig() {
    }
}
