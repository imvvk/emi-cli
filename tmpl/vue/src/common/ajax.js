import Axios from 'axios';
import qs from 'qs';
import Jsonp from 'jsonp';
import Vue from 'vue';

let vue = new Vue();

/**
 * 发送ajax请求
 *
 * @param {string} obj ajax请求参数, 与 Jquery.ajax() 的参数相同
 * @param {string} obj 多个参数时, 可以同时发送N个异步请求, 当
 *        所有异步请求完成, 触发回调函数。
 * @return {Object} Promise 对象, 可以使用 Promise 对象的所有方法
 */
function Ajax () {
    let promises = Array.from(arguments).map(param => {
        // 格式化参数
        param = Object.assign({
            method: 'get',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            withCredentials: false,
            params: (!param.method || param.method == 'get') && param.data,
            defaultErrorHandle: true,
        }, param);
        if (param.method.toLowerCase() === 'post' && param.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            param.data = qs.stringify(param.data || {});
        }
        return new Promise(function(resolve, reject){
            if (param.dataType === 'jsonp') {
                // 跨域请求
                Jsonp(param.url, { param: param.data }, function (err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            } else {
                // 普通请求
                Axios(param).then(response => {
                    resolve(response);
                }).catch(response => {
                    reject(response);
                });
            }
        });
    });

    return Promise.all(promises).then(responses => {
        let errResponse = false;
        let success = !responses.some(response => {
            let fail = response.data.status != 0;
            fail === false && ( errResponse = response );
            return response.data.status != 0;
        });
        if (success === false) {
            let exception =  new Error('Business Exception');
            exception.response = errResponse;
            throw exception;
        } else {
            return responses.length === 1 ? responses[0] : responses;
        }
    }).catch(e => {
        let response = e.response;
        if (response.config.defaultErrorHandle === true) {
            // 走默认异常处理
            let errorMessage = '';
            if (e.message === 'Business Exception') {
                // 业务异常
                errorMessage = response.data.message;
            } else {
                // 非业务错误异常(ex. 404 等异常)
                errorMessage = response.status + ' : ' + response.statusText;
            }
            vue.$message({
                message: errorMessage,
                type: 'error'
            });
        } else if (response.config.defaultErrorHandle instanceof Function) {
            response.config.defaultErrorHandle(response);
        }
        throw e;
    });
}

// 扩展为 vue 插件模式
// vue.use(Ajax)后, 在组件中通过 this.$ajax() 调用
Ajax.install = function(Vue) {
    Vue.prototype.$ajax = Ajax;
};

export default Ajax;
