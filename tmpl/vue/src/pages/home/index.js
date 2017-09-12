
import '../../scss/common.scss'; 
import Vue from  'vue';
import App from './App.vue';


import router from './router';

import store from './vuex/store.js';


new Vue({

    el : '#app',
    
    store : store,

    router : router,

    render(createElement) {
        return createElement(App);
    }

});
