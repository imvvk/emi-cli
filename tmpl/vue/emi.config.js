var path = require('path');
var webpack = require('webpack');
var HappyPack = require('happypack');
var os = require("os");
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
var glob = require('glob');


function resolve (dir) {
    return path.join(__dirname, './', dir)
}

var cssLoader = { vue : true }; // vue 项目必备, 添加 vue-style-loader

// 生成出入口
// -------------------------------
// 提取模块名称
var modulesName = glob.sync('./src/pages/*/index.js').map(f => {
    return /.*\/(src\/pages\/(.*?)\/index)\.js/.exec(f)[2];
});
// 根据模块生成相应 entry entryHtml
var entry = {};
var entryHtml = [];
modulesName.forEach(fileName => {
    entry[fileName] = `./src/pages/${fileName}/index.js`;
    entryHtml.push({
        filename : `${fileName}.html`,
        template : `./src/template/index.html`,
        inject : "body",
        chunks : ['vendor', fileName ]
    });
});


// 配置
module.exports = {
    analyze : true,
    commonPack :true ,
    library : {
        'vendor' : [
             'vue', 'vue-router', 'vuex',    'element-ui', 'axios', 'moment'
        ],
        'echarts' : ['echarts']
    },
    libraryManual :    'group',

    entry : entry,
    entryHtml : entryHtml,
    openBrowser: '/demo.html', // 服务启动后, 默认打开地址

    htmlMode : "inject",
    //historyApi : true, //开启HTML5 historyAPI    server 使用 所有的访问都到index.html 下
    cssLoader : cssLoader,

    serverCommonds : ['node ./element-theme.js' ],
    //staticPath : 'static',//不需要转化的静态资源文件

    //路径配置
    // publicPath 同 output 的 publicPath 虚拟路径
    pathMap : {
        dev : {
            publicPath : "/",
        },
        prd : {
            publicPath : "./"
        }
    },

    // 设置请求代理
    proxyTable: {
        //  '/v2'  --  被拦截请求的正则匹配式
        '/v2': {
            target: 'http:www.mi.com',   // 代理服务器地址
            changeOrigin: true,
            pathRewrite: {
                // '^/html': ''
            }
        },
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
            'element-ui$': 'element-ui/lib/element-ui.common.js',
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
                test: /\.vue$/,
                loader: 'vue-loader',
                options : {
                    loaders : emiUtils.cssLoader(cssLoader)
                }
            },
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
            },
            {
                enforce: 'pre',
                test: /\.js|\.vue$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {
                    cache: false,
                }
            },
        ]
    },
    plugins : [
        // 多线程加速打包速度
        new HappyPack({
            id : "babel",
            threadPool: happyThreadPool,
            cache : true,
            loaders : [
                {
                    loader : "babel-loader" ,
                    query: {
                        cacheDirectory: path.resolve(__dirname, "./.cache")
                    }
                }
            ]
        })
    ]
}
