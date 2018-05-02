import * as types from '../mutation-types';
import Ajax from 'src/common/ajax.js';

const state = {
    options: [],
};

// getters
const getters = {
    options: state => state.options
};

// actions
const actions = {
    upOptions ({ commit, state }, products) {
        Ajax({
            url: '/upOptions',
        }).then(response => {
            commit(types.UP_OPTIONS, response.data.result);
        });
    }
};

// mutations
const mutations = {
    [types.UP_OPTIONS] (state, options) {
        state.options = options;
    },
};

export default {
    state,
    getters,
    actions,
    mutations
};
