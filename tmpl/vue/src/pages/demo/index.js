/**
 * 用途: 入口 JS 文件
 * 作者: 张波波
 */
import Vue from 'vue';
import 'src/common/commonSource.js';

import App from './App';
import router from './router';
import store from './store';

new Vue({
    el: '#app',
    store,
    router,
    template: '<App/>',
    components: { App }
});
