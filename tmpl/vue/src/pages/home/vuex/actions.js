
import * as Types from './mutation-types.js';

import axios from 'axios';


export default {

    exampleAction({state, commit}) {
        //var json = {UserName : 'abc'};
        //commit(Types.USER_INFO, json); 
    },

    /**
     * 异步Action 
     *
     */
    async asyncExampleAction({state, commit}, id) {
        var res = axios.get('/xxxxxxxx', {
            params : {
                userId : id 
            }
        });

        var result = res.data.result;
        commit(Types.USER_INFO, result);
    } 
};
