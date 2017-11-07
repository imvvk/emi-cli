### ajax.js
> Example

```
import Ajax from 'ajax.js';
...
Ajax({
    url: '/demo/names',
    method: 'get',
    data: {
        area: 'mi'
    },
    defaultErrorHandle: true | Function, // 是否调用默认异常处理函数, 可传入函数覆盖
}).then(response => {
    // 处理结果
}).catch(response => {
    // 处理异常结果
})
```

> 多个异步请求结束后触发回调函数

```
import Ajax from 'ajax.js';
...
Ajax({
    url: '/demo/names',
    method: 'get',
    data: {
        area: 'mi'
    }
}, url: '/demo/names1',
    method: 'get',
    data: {
        area: 'mi1'
}).then(responses => {
    // 处理结果
    // responses 是 response 的数组, 顺序和传递的参数一一对应
}).catch(responses => {
    // 处理异常结果
})
```

> 跨域请求

```
// 类似 jquery: dataType 设置为 'jsonp'
import Ajax from 'ajax.js';
...
Ajax({
    url: '/demo/names',
    method: 'get',
    data: {
        area: 'mi'
    },
    dataType: 'jsonp'
}).then(response => {
    // 处理结果
}).catch(response => {
    // 处理异常结果
})

// 支持 cross-site Access-Control 的接口. 设置withCredentials: true
Ajax({
    url: '/demo/names',
    method: 'get',
    withCredentials: true
}).then(response => {
    // 处理结果
}).catch(response => {
    // 处理异常结果
})
```

> 支持 vue 插件模式

```
// index.js 
import Vue from 'vue';
import ajax from 'ajax.js';
...
Vue.use(ajax);

// 组件中调用
this.$ajax({
    url: '/demo/names',
    method: 'get',
    withCredentials: true
}).then(response => {
    // 处理结果
}).catch(response => {
    // 处理异常结果
})
```

> Ajax 返回结果数据结构

```
{
    status: 0, // (0 - 成功) (非零 - 业务逻辑错误)
    message: '', // 处理结果信息
    result: {}, // 返回的数据
}
```


### moment.js

> Example

```
import Vue from 'vue';
import moment from 'src/common/meoment.js';
...
Vue.use(moment);

// 在组件中调用
let now = this.$Moment().format('YYYY/MM/DD');
```
