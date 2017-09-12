
import * as Types from  './mutation-types.js';
//示例
export default {
    [Types.USER_INFO](state, data) {
        state.userInfo = data;
    }
};
