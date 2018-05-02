import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';
import options from './modules/options';

Vue.use(Vuex);

export default new Vuex.Store({
    actions,
    getters,
    modules: {
        options
    },
});
