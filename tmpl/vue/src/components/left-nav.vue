<!--
用途: 侧边导航栏
作者: 冷雪峰
 -->
<template>
    <div class="left-nav">
        <el-menu :default-active="currentIndex + ''" mode="vertical">
            <el-menu-item v-for="(item, index) in menuInfoList"
                :index="(index+1).toString()"
                :key="index"
                @click="pageTo(item.name)">
                {{ item.title }}
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script>
export default {
    name: 'left-nav',
    data () {
        return {
            currentIndex: '1'
        };
    },
    props: {
        menuInfoList: {
            type: Array,
            required: true
        },
        activeIndex: {
            type: [ String, Number ],
            default: '1'
        }
    },
    watch: {
        $route (to) {
            this.menuInfoList.map((menuItem, index) => {
                if (menuItem.path.split('/')[1] === to.path.split('/')[1]) {
                    this.currentIndex = index + '';
                    return;
                }
            });
        },
        activeIndex (val, oldVal) {
            this.currentIndex = val;
        }
    },
    methods: {
        pageTo (name) {
            this.$router.push(name);
        }
    }
};
</script>

<style lang='scss' scoped>
.left-nav {
    position: fixed;
    top: 60px;
    left: 0;
    bottom: 0;
    width: 140px;
    background: #f6f8fb;
    text-align: center;
}
</style>
