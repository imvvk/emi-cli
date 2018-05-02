<!--
用途: 顶部导航栏
作者: 冷雪峰
-->
<template>
<div class='top-nav'>
    <div class='logo-wrap'>
        <div class='logo' >
            <a href='/main.html' ><micon name="logo" :width='36' :height='28' :css="{'margin-right' : '6px', 'vertical-align': '-7px'}" fill="#fff"></micon>商业产品部</a>
        </div>
    </div>
    <div class='nav-wrap'>
        <el-menu :default-active='activeIndex + ""' class='el-menu-demo' mode='horizontal' @select='handleSelect'>
            <el-menu-item v-for='(tab, index) in tabInfoList' :index='(index+1).toString()' :key='index' @click='goToLink(index)'>
                <micon :name="'nav-'+tab.icon" :width='tab.width' :height='tab.height' class-name='nav-icon'></micon><span>{{tab.name}}</span>
            </el-menu-item>
        </el-menu>
    </div>
</div>
</template>
<script>
export default {
    name: 'top-menu',
    props: {
        // 默认激活的 tab 页
        activeIndex: {
            type: [ String, Number ],
            default: '1'
        },
        // 导航栏列表
        tabInfoList: {
            type: Array,
            required: true,
        }
    },
    data: function () {
        return {
        };
    },
    methods: {
        handleSelect(key, keyPath) {
            return keyPath;
        },
        goToLink: function(index) {
            if (this.tabInfoList[index].pageName) {
                window.location.href = window.location.origin + `/${this.tabInfoList[index].pageName}.html#/`;
            }
        }
    },
    mounted: function () {
    }
};
</script>
<style lang='scss'>
.top-nav {
    position : fixed;
    top : 0;
    left : 0;
    width : 100%;
    min-width : 1220px;
    z-index : 10;
    background-color : #4da1ff;

    .logo-wrap {
        float : left;
        width : 192px;
        height : 60px;
        line-height : 60px;
        text-align : center;
        a {
            color : #fff;
            text-decoration: none;
            font-size : 18px;
        }
    }
    .nav-wrap {
        float : left;
        .el-menu--horizontal>.el-menu-item:hover:not([class^=el-icon]) {
            color : #fff;
        }
        .nav-icon {
            vertical-align : -3px;
            margin-right : 5px;
        }
    }
}
</style>
