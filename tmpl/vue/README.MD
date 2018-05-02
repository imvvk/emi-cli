### 项目准备
---
```
  // 全局安装工具
  npm i -g emi-cli
  // 安装依赖包
  npm install
  // 启动监听服务  访问地址: http://127.0.0.1:9000/html/demo.html
  emi start 
```


### 常用命令
---
```
  // 生成前端分析页面, test/_analysis.html
  npm run analysis
  // 启动监听 element-theme 主题修改服务
  npm run ele-theme
```


### 目录结构
---
```
├── README.MD
├── emi.config.js (基础配置)
├── package.json
├── postcss.config.js
├── dist
│   ├── dll
│   │   ├── files.json
│   │   └── vendor-manifest.json
│   ├── html
│   │   └── demo.html (入口html)
│   ├── scripts
│   │   └── demo.js
│   ├── styles
│   │   └── demo.css
│   ├── manifest.json
│   └── vendor.[hash].js (独立打包的第三方库, 如 vue, vuex)
├── src
│   ├── App.vue
│   ├── assets (图片资源)
│   ├── common (JS工具库)
│   │   └── EventBus.js
│   ├── components (业务组件)
│   ├── libs (npm 中没有的第三方库)
│   ├── pages (页面)
│   │   └── demo (模块名称)
│   │       ├── demo1.vue
│   │       ├── index.js (模块入口js)
│   │       ├── router
│   │       │   └── index.js
│   │       └── vuex
│   │           ├── action-types.js
│   │           ├── actions.js
│   │           ├── getter.js
│   │           └── store.js
│   ├── scss (通用scss)
│   ├── theme (element-theme 源文件)
│   │   ├── src
│   │   ├── dist (主题编译结果)
│   │   └── element-variables.css
│   └── template (页面模板)
│       └── index.html
└── test
    └── _analysis.html (网站性能分析页面)
```


### 产品原型
---
* [文档地址] ()
* [原型PRD]()
* [GIT地址]()


### 懒加载
---
[vue-router](https://router.vuejs.org/zh-cn/advanced/lazy-loading.html)
[vue异步组件](https://cn.vuejs.org/v2/guide/components.html#高级异步组件)
[Webpack代码分离](https://doc.webpack-china.org//guides/code-splitting-async/#require-ensure-/)


### 第三方库
---
[Axios](https://github.com/mzabriskie/axios): ajax工具库
[moment](https://github.com/moment/moment): 时间处理工具
[moment 文档](http://momentjs.com/docs/#/displaying/)


### 常用代码
---

```
    // 公共资源
    src/common/commonSource.js  //页面中引用的公共的样式 以及VUE 注册的模块 一般在  dir/index.js 入口文件中引用
    
    src/components/svg   //micon SVG ICON组件  
    //模板示例：
    <micon :name="'nav-icon'" :width="width" :height="height" :class-name="'nav-icon'"></micon>
    
    src/components/db_select.vue  常用基础下拉框 数据从 /v2/basic/options 中取得支持v-model
    //模板示例
      <db-select data-key="salesGroup" v-model="salesGroupId" placeholder="请选择销售组" @change="selectSaleChange"></db-select>
```

```    
    // element 按需引入
    // 完成组件列表: https://github.com/ElemeFE/element/blob/dev/components.json                          
    import Vue from 'vue'
    import { Button, Select } from 'element-ui'
    import App from './App.vue'

    Vue.component(Button.name, Button)
    Vue.component(Select.name, Select)
    /* 或写为
     * Vue.use(Button)
     * Vue.use(Select)
     */
```

```
    // 自定义主题 (配置文件: element-theme.js)
    // 修改 src/theme 中的 主题源文件 会自动编译主题到 src/css/element-theme
    npm run ele-theme

    // 具体主题定制可参照 http://element.eleme.io/#/zh-CN/component/custom-theme
    
```


### SVG图标
---
[优化SVG图标](https://github.com/svg/svgo)
[Feather - svg图标开源库](https://github.com/colebemis/feather)
[loading 图标](https://github.com/SamHerbert/SVG-Loaders)
[WebFont 压缩工具](https://github.com/aui/font-spider/blob/master/README-ZH-CN.md)
[SVG -> WebFont](https://github.com/jeerbl/webfonts-loader)
[SVG -> WebFont](https://github.com/itgalaxy/webpack-webfont)
[SVG vs Icon font](http://www.jianshu.com/p/fb3ce4b9c765)
[SVG 组件生成工具](https://github.com/MMF-FE/vue-svgicon)
[SVG sprites](https://github.com/mrsum/webpack-svgstore-plugin)


### ESLINT
---
[官网](https://github.com/MoOx/eslint-loader)
[使用指南](http://www.cnblogs.com/hahazexia/p/6393212.html)
[rules](http://eslint.org/docs/rules/)
```
  // 安装
  npm i eslint -g
  // 初始化配置文件
  eslint --init
  // 安装loader
  npm i eslint-loader
  // 安装eslint插件 可以检查混淆在 html .vue 中的JS代码
  npm i eslint-plugin-html

  // emi.config.js 中配置loader
  {
    enforce: 'pre',
    test: /\.js|\.vue$/,
    exclude: /node_modules/,
    loader: 'eslint-loader',
    options: {
      cache: true,
      failOnWarning: true,
      failOnError: true
    }
  }
  // .eslintrc 中配置插件
  // plugins 属性值 可以省略包名的前缀 eslint-plugin-
  "plugins": [
    "html"
  ]
```


### TODO
---






   
