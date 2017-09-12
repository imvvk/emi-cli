<template>
    <div class="header">
        <ul>
            <li>
                <router-link to="home">首页</router-link>
            </li>
            <li>
                <router-link to="home">列表页</router-link>
            </li>
        </ul>
    </div>
</template>

<style lang="scss">
    .header {
        height : 60px;
        line-height : 60px;
        ul {
            overflow : hidden; 
            li {
                float : left; 
                margin-right : 20px;
            }
        } 
    }
</style>

<script>
    export default {
        name : 'm-header',
        
        data () {
            return {}; 
        }

    }
</script>

