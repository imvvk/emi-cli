/**
 * 用途: 路由配置
 * 作者: 张波波
 */
import Vue from 'vue';
import Router from 'vue-router';
import demo from 'src/pages/demo/demo';
import demoChild from 'src/pages/demo/demo1';

// 动态加载组件书写范例
// const demo = resolve => require(['src/pages/demo/demo.vue'], resolve)
// const demoChild = resolve => require(['src/pages/demo/demo1.vue'], resolve)

Vue.use(Router);

let vue = new Vue();
let router = new Router({
    routes: [
        {
            name : 'demo',
            path: '/demo',
            component: demo,
            children: [{
                name : '/child',
                path: 'child',
                component: demoChild
            }]
        },
    ]
});

// router.beforeEach(transition => {
//     let loading = vue.$loading({
//         background: 'red',
//         fullscreen: true,
//         lock: true,
//         text: '拼命加载中',
//         // spinner: '',
//     });

//     setTimeout(() => {
//         loading.close();
//     }, 2000);
// });

export default router;

