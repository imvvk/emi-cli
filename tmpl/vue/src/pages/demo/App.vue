<!--
用途: 入口 .vue 文件
作者: 张波波
-->
<template>
    <div>
        <top-nav :active-index="topNavActiveIndex" :tab-info-list="tabInfoList"></top-nav>
        <left-nav :active-index="leftNavActiveIndex" :menu-info-list="menuInfoList"></left-nav>
        <router-view></router-view>
    </div>
</template>
<script>
import topNav from 'components/top-nav';
import leftNav from 'components/left-nav';
export default {
    name: 'app',
    components: { topNav, leftNav },
    data () {
        return {
            // 顶部导航栏列表
            tabInfoList: [{
                name: '顶部导航1',   // 导航名称
                pageName: 'order',  // 该模块 html 名称
                icon : 'order',     // 图标
                width : 16,         // 图标宽度
                height : 20         // 图标高度
            }, {
                name: '顶部导航2',
                pageName: 'customer',
                icon : 'customer',
                width : 17,
                height : 20
            }],
            // 顶部导航栏默认激活页(从1开始)
            topNavActiveIndex: 1,

            // 侧边导航栏列表
            menuInfoList : [{
                title: '侧边导航1',   // 导航名称
                path: '/ad',         // 导航的路径
                name: 'ad',          // 导航名称, 可以在 route.js 中查看
            },
            {
                title: '侧边导航2',
                path: '/tmp/list',
                name: 'tmpList'
            }],
            // 侧边导航栏默认激活页(从1开始)
            leftNavActiveIndex: 1,
        };
    },
    mounted () {
    }
};
</script>
