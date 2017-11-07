/**
 * 用途: 通用引用配置
 * 作者: 张波波
 * 日期:
 */

import Vue from 'vue';

import '../scss/common.scss';
import 'src/assets/dist/sprite.css';
import normalize from 'normalize.css';
import elementUi from 'element-ui';
import 'src/theme/dist/index.css';

import ajax from 'src/common/ajax';
import moment from 'src/common/moment';

Vue.use(elementUi);
Vue.use(ajax);
Vue.use(normalize);
Vue.use(moment);
