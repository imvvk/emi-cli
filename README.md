# emi-cli 

基于Webpack的打包 编译工具

###  本意是webpack2.0  打包慢 配置复杂 为了简化配置 定义全局的通用配置 然后加以自己定义的项目特需配置 加入happypack 以加速，随着Webpack 4 发布后 绝大需求能够满足，此工具暂停维护


### 安装 

```
npm install -g emi-cli
```

当前webpack 4 版本

安装成功后会在 用户目录（例如 ~/）下建立 .emirc 文件， 里面内容可以设置 registry git 地址 下载模板GIT地址

和 npm 安装仓库  

```
registry=
git=
```

### 使用方法



1.根据模版新建项目

```
emi init   <template-name> [project-name] 
example :
emi init vue demo

# 如果是git 项目 需要先设定 git地址
# 如下执行 
# emi set git http://gitxxxxxxx
emi init xxx/aaaa demo

#拷贝某一分支
emi init xxx/aaaa#1.0.0 demo
```

template 可以是自带模板名称 : vue vue1 react normal empty    , 也可以是 git  目录  类似  xxx/project 模式 也可以通过 #branch 指定拷贝模板分支   xxx/project#branch 

模板建立完成后，会执行npm install 安装依赖 



2.启动开发服务器

```
emi start   //在项目目录下执行此命名  默认启动9000 端口 采用的是webpack-dev-middleware 做中间件
emi start -p 9100  // 启动9100 的端口
emi start -p 9100 -q  // -q  安静模式 不打印编译日志
```



3.编译代码

```
emi build // 对当前项目进行编译 编译生产环境代码 到dist 目录
emi pack  // 对当前项目进行编译 单是不进行minify 到dev 目录
```



4.watch 模式

```
emi watch  //对当前项目进行watch 如果文件发生改变 编译到 dev 目录 可以用作 library module 开发
```



5.设置变量

```
emi set name value //想.emirc 设置变量  name=value   一般是用来设置git=xxxxxxxxx
```



6.清空项目目录 

```
emi clean 
```

7.安装git 组件

```
emi install gitpath
emi install -C short_gitpath
emi install --component short_gitpath
example:
emi install miui_ad_fe_component/search-table
emi install -c search-table
```



PS:

开发模式(dev)是 start 是启动http server调试     watch 模式（dev） 打包目录是dev    生产环境是 prd  打包目录是 dist 

### 内置全局方法 

全局变量 emiUtils

1.emiUtils.cssLoader  创建样式加载器， 主要服务于vue-loader  

```
var cssLoader = {
    extract : {
        allChunks : true  //快速设置 extract-text-webpack-plugin 配置 为了兼容emi-cli 0.2 以下 建议配置在 prdConfig {Function} 中
    },
    vue : true,  // 指定是vue 项目 css loader 的fallback 使用vue-style-loader  否则 使用style-loader
    happypack : true //使用happypack 进行加速编译 ， 默认为false , 如果为true 外部的 cssLoader 也必须设置happypack : true
    
}

module.exports = {
   cssLoader : cssLoader, //外部CSS SASS LESS 等配置使用 比如 import ${path}/xxx.scss
   
   module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options : { 
            loaders : emiUtils.cssLoader(cssLoader) //vue loader 配置使用， 解析*.vue 文件中的 样式
          }
        }
      ]
   }
}
```

2.emiUtils.dllReferenceSync 返回一个 DllReferencePlugin 插件， 只是manifest 文件是可以同步从 http:// https://的网络（CDN）读取 ， 也可以从本地文件读取。这样可以重用已经打包好的DLL 文件。

```
plugins : [				
    emiUtils.dllReferenceSync('http://t3.market.xiaomi.com/download/Custom/libs/dll/vue_elementui-manifest.json')  
],
```

 



### 配置文件说明 : emi.config.js

- entry  项目入口文件 对应webpack entry   

- entryHtml 项目HTML 文件  如果设定将用 html-webpack-plugin  进行编译

- library  DLL 文件制定 可以在library 中指定多个dll 配置  比如  默认dll 都会在html 中引用  

  ```
  library : {
    vendor : ['vue', 'vuex', 'vue-router', 'element-ui'], //vue相关配置
    echarts : ['echarts']  //图表配置
  }
  ```


- libraryManual     值有 'group'  或者 function  设定 dll 如何引入到html , 如下配置 vendor , a会引入到a.html

  vendor echarts b   会引入到 b.html

  ```
  library : {
    vendor : ['vue', 'vuex', 'vue-router', 'element-ui'], //vue相关配置
    echarts : ['echarts']  //图表配置
  },
  libraryManual : 'group',
  entry : {
    	a : 'src/a.js',
    	b : 'src/b.js'
  }
  entryHtml : [
    {
      filename : 'a.html',
      chunks : ['vendor', 'a']
    },
     {
      filename : 'b.html',
      chunks : ['vendor', 'echarts', 'b']
    }
    
  ]
  ```


- cssLoader  emi-cli 会提供默认的cssLoader 加载器， 此配置是为了加入自定义的配置

  ```
  cssLoader : {
    extension : ['css', 'scss', 'sass'] //设定要添加的loader less 可以是 ['css', 'less'] 默认是 ['css', 'scss', 'sass'],
    packCss : false / true  //默认false  如果设置为true 开发模式css 则是用extractTextPlugin 进行打包，这样就会没有热刷新功能
    happaypack : false / true //是否用happypack 编译 样式文件
    vue : false ／ true,  //true说明是vue 项目 fallback 使用vue-style-loader 默认是style-loader
    sass : {includePaths : ['xxxx']},  //可以设定自定义的配置
    scss : {includePaths : ['xxxx']},
    less : {},
    postcss : {}
  }
  ```


- commonPack    Boolean值    默认是true, 如果有2个以上的entry 入口， 将打包一个 公共包 加快编译速度。此选项开启 会设置ExtractText 的option allChunks 为true   

- minify  是否压缩代码  编译公共模块时可能不需要压缩代码

- analyze      false/true/Object     ture 或 object 生产环境编译完后显示 report.html 配置参考： webpack-bundle-analyzer

- openBrowser  Boolean or String   开发模式下启动Server服务打开一个页面， 如果是true 默认打开一个 entryHtml的第一个出口文件，  如果是String 打开此链接 如果指配置路径/xxxx 则打开http://127.0.0.1:port/xxxx 

- serverCommonds  Array 数组  指定一些启动server 后要执行的命令 比如 server启动后 再启动一个命令监听element-ui 主题文件的修改 并编译主题

  ```
  serverCommonds : ['node ./element-theme.js' ]
  ```

- proxyTable  代理转发配置 用来调试后台接口 详细配置见 http-proxy-middleware  

- historyApi Boolean  false / true/Object  单页面APP 使用 可以 默认请求映射到 index.html 配置 见connect-history-api-fallback

- htmlMode  ： 'inject'   生成html 的方式 默认是注入 为以后拓展保留属性

- staticPath    静态目录  编译完成后 会将此目录拷贝到 dist 目录  可以放置一些视频 或者大文件  ， 使用copy-webpack-plugin ，如果是字符串 是指对于路径， 如果是object 则是copy-webpack-plugin  的配置文件 

- pathMap  快速配置publicPath  的选项 如果output有设定 则用output 的publicPath

  ```
  pathMap : {    
      dev : {
        publicPath : "/",
      },
      prd : {
        publicPath : "//somedomain.com/"
      }
  }
  ```

- optimizeCss  Boolean or Object 默认true  生产环境开启样式优化 true 使用默认配置， Object 使用自定义配置 

- dllDevConfig  {Function}  dll 的dev 开发模式的 webpack 配置  优先级最高  需要返回 一个webpack 配置

- dllPrdConfig {Function} dll 的prd 生产环境 webpack 配置  优先级最高  需要返回 一个webpack 配置

- devConfig {Function}  项目中的 dev 开发模式的 webpack 配置  优先级最高  需要返回 一个webpack 配置

- prdConfig {Function}  项目中的 dev 开发模式的 webpack 配置  优先级最高  需要返回 一个webpack 配置


  ```
  var path = require('path');
  var webpack = require('webpack');
  var HappyPack = require('happypack');
  var os = require("os");
  var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
  var glob = require('glob');



  function resolve (dir) {
    return path.join(__dirname, './', dir)
  }

  // Plugins
  // -------------------------------
  var plugins = [
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
  ];


  // Loaders
  // -------------------------------
  let rules = [
    {
      enforce: 'pre',
      test: /\.js|\.vue$/,
      exclude: /node_modules/,
      loader: 'eslint-loader',
      options: {
        cache: false,
        // eslintPath: path.join(__dirname, 'config/eslint.config.js')
        // failOnWarning: true,
        // failOnError: true
      }
    }
  ];
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
      filename : `html/${fileName}.html`,
      template : `./src/template/index.html`,
      inject : "body",
      chunks :  fileName === 'monitor' ?  [ 'vendor', 'echarts' , fileName ] : [ 'vendor', fileName ]
    });
  });
  entryHtml.unshift({filename : `main.html`});//This is for default opened file and this is temporary 

  var cssLoader = {
     
      vue : true,

      happypack : true 
  }


  module.exports = {
    analyze : true,
    commonPack :true ,
    library : {
      'vendor' : [
         'vue', 'vue-router', 'vuex',  'element-ui', 'axios', 'moment'
      ],
      'echarts' : ['echarts']
    }, 
    libraryManual :  'group',
   
    entry : entry,
    
    htmlMode : "inject",

    entryHtml : entryHtml,
    //historyApi : true, //开启HTML5 historyAPI  server 使用 所有的访问都到index.html 下
    cssLoader : cssLoader,
    serverCommonds : ['node ./element-theme.js' ],
    
    staticPath : 'static',//不需要转化的静态资源文件 
    
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
    proxyTable: {
      '/api': {
        target: 'http://somedomain/',
        changeOrigin: true,
        pathRewrite: {
          // '^/html': ''
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
        }
      ].concat(rules)
    },
    plugins : plugins，
     
    prdConfig(outpath, emiConfig) {

          return { plugins  : [
                      new ExtractTextPlugin({
                          allChunks : true,
                          filename : 'styles/[name].[contenthash].css'
                      })
                  ]
          }
      }

  }

  ```

   ……..

   emi.config.js 中可以加入 resolve  module plugins 配置 都会作为 webpack 不区分环境的 公共配置， 优先级低于  devConfig   prdConfig 中的配置 







#### ChangeLogs

v0.20 add happypack webpack-parallel-uglify  support  
v0.21 optimizeCss default false. It will add optimizeCss Plugin  if  optimizeCss set  in config .  emi init  could copy from git registry

v0.2.12 add extract Object options  
        dev mode  default is not  use  extract

v0.3.0 重构代码

v0.3.3 fix output merge bug ， add read dll reference config (http / file)

v0.3.4 openBrower 优化 ， 增加http proxy 功能  

#### todos:
- DEV 模式下 dll 的开发配置 
- https support …

