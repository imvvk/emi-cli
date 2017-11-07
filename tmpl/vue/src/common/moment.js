/**
 * 用途: 时间处理函数
 * 作者: 张波波
 * 日期:
 */
import Moment from 'moment';

export default Moment.install = function(vue) {
    vue.prototype.$Moment = Moment;
};
