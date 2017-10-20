
const path = require("path");
const webpack = require("webpack");
var HappyPack = require('happypack');
var os = require("os");
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });



var entry = {
    index :  "./src/js/index.js",
    plan :   "./src/js/plan.js",
    data :   "./src/js/data.js",
    tools :  "./src/js/tools.js",
    preview :"./src/js/preview.js",
    finance :"./src/js/finance.js",
    agent : "./src/js/agent.js",
    agent_data: "./src/js/agent_data.js",
    agent_finance: "./src/js/agent_finance.js",
    agent_sys: "./src/js/agent_sys.js",
    help : "./src/js/help.js",
    register : "./src/js/register.js",

}

var entryHtml = Object.keys(entry).map(function (key) {
    return  {
        filename : key +".html",
        template : "src/"+key+".html",
        inject : "body",
        chunks : [key]
    }
});

module.exports = {
    
    library : {
        vendor : [
         'jquery', 'vue', 'vue-router', 'vue-resource' 
		]
    },

    entry : entry,

    htmlMode : "inject",

    entryHtml : entryHtml,

    cssLoader : {
        sass :  {
            includePaths : [path.resolve(__dirname, "./node_modules/compass-mixins/lib")] 
        },
        vue : true
    },
    //staticPath : "static",

    module : {
        rules : [
            {
                test : /\.vue/,
                loader : "vue-loader",
                options : {
                    js :  "happypack/loader?id=babel"
                }
            },
            {
                test: /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/,
                loaders: [
                    //url-loader更好用，小于10KB的图片会自动转成dataUrl，
                    //否则则调用file-loader，参数直接传入
                    'url-loader?limit=10000&name=static/img/[hash:8].[name].[ext]&publicPath=/v2/dist/'
                ]
            },
            {
                test: /\.((ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9]))|(ttf|eot)$/,
                loader: 'url-loader?limit=10000&name=static/fonts/[hash:8].[name].[ext]&publicPath=/v2/dist/'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'happypack/loader?id=babel'
            },
            /**
            {
                test: /\.js$/,
                //exclude: /node_modules\/(?!emi-ui)/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-runtime']
                }
            }
            **/
            
        ]  
    },
    resolve : {
        alias : {
            "common" : path.resolve(__dirname, "./src/components/common"),
            "emi-ui" : path.resolve(__dirname, "./src/emi-ui"),
            "src" : path.resolve(__dirname, "./src")
        } 
    },
    plugins : [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new HappyPack({
            id : "babel",
            threadPool: happyThreadPool,
            loaders : [
                {
                    loader : "babel-loader" , 
                    query: {
                        presets: ['es2015'],
                        plugins: ['transform-runtime']
                    }

                }
            ]

        })
    ]
}

