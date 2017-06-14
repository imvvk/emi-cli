import Vue from 'vue'
import Vuex from 'vuex'

import * as actions from './actions.js';
import * as getters from './getters';
import * as type from './actions-type.js'

Vue.use(Vuex);

const state = {

}

const mutations = {

}

var store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})

export default store;

