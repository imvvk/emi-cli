# emi-cli

emi fe develop tool

### usage

**emi init   [project-name] <template-name>**

 template is  vue react  normal vue1 empty 



**emi start** 

start a local server  in port 9000 default

emi start -p  9900

start a local server in port 9900 

**emi pack** 

pack local project  dont minify  development context

**emi build**

build local project  minify   production context





```

var path = require('path');

function resolve (dir) {
    return path.join(__dirname, './', dir)
}

//

module.exports = {
     library : {
        vendor : [
          'vue', 'vue-router'
		]
    }, 
    entry : {
        "main" : "./src/main.js",
    },

    htmlMode : "inject",

    entryHtml : [
        {
            filename : "index.html",
            template : "src/index.html",
            inject : "body",
            chunks : ["main"]
        }
    ],
    historyApi : true, //开启HTML5 historyAPI  server 使用 所有的访问都到index.html 下

    //staticPath : 'static',//不需要转化的静态资源文件 
  
    //路径配置 
    //assetsPath 会增加到 filename 的前面生成物理路径
    //publicPath 同 output 的 publicPath 虚拟路径 
    
    pathMap : {
        dev : {
            assetsPath : "static",  
            publicPath : "",
        },
        prd : {
            assetsPath : "static",
            publicPath : ""
        }
    },
    
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        modules: [
            resolve('src'),
            resolve('node_modules')
        ],
        alias: {
            'vue$': 'vue/dist/vue.common.js',
            'src': resolve('src'),
            'assets': resolve('src/assets'),
            'components': resolve('src/components')
        }
    },

    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options : { 
                    loaders : emiUtils.cssLoader(
                        {
                         extract:true,
                         sourceMap:true, 
                         postcss : [
                            require('autoprefixer')({
                                browsers: ['last 2 versions']
                            }) 
                         ]
                    })
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src')]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
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
    }

}

```



