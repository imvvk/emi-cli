<template>
<div >
    <page-header></page-header>
    <div class="main">
        <router-view></router-view>
    </div>
    <page-footer></page-footer>
</div>
</template>

<script>

    import Header from 'components/Header.vue';
    import Footer from 'components/Footer.vue';

    export default {
        name : 'app', 
        components : {
            PageHeader : Header,
            PageFooter : Footer
        }
    };
</script>
