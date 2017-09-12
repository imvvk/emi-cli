/**
* @file config.js
* @brief 项目的一些全局配置 
*/
import Vue from  "vue";

/**
 * 注册ELEMENT 组件
 **/
import {
    Dialog,
    Pagination,
    Select,
    Option,
    Input,
    InputNumber,
    Button,
    ColorPicker,
    Radio,
    RadioGroup,
    RadioButton,
    Checkbox,
    CheckboxGroup,
    Upload,
    Loading,
    Message,
    MessageBox,
    DatePicker,
    Table,
    TableColumn
}  
from "element-ui";

Vue.component(Dialog.name, Dialog);
Vue.component(Pagination.name, Pagination);
Vue.component(Select.name, Select);
Vue.component(Option.name, Option);
Vue.component(Input.name, Input);
Vue.component(InputNumber.name, InputNumber);
Vue.component(Button.name, Button);
Vue.component(ColorPicker.name, ColorPicker);
Vue.component(Radio.name, Radio);
Vue.component(RadioGroup.name, RadioGroup);
Vue.component(RadioButton.name, RadioButton);
Vue.component(Checkbox.name, Checkbox);
Vue.component(CheckboxGroup.name, CheckboxGroup);
Vue.component(Upload.name, Upload);
Vue.component(DatePicker.name, DatePicker);
Vue.component(Table.name, Table);
Vue.component(TableColumn.name, TableColumn);

Vue.prototype.$message = Message;
Vue.prototype.$loading = Loading.service;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;



import axios from 'axios';
import cookies  from 'src/common/cookies.js';
import type from 'src/common/type.js';

/**
 * 添加拦截器
 **/

axios.defaults.baseURL = '/service';
//axios.defaults.timeout = 2000;
//axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

var qs = function (obj) {
    var rs =[];
    Object.keys(obj).forEach((key) => {
        if (type(obj[key]) !== 'undefined' ) {
            rs.push(key +'='+encodeURIComponent(obj[key]));
        }
    })
    return rs.join("&");
}



axios.interceptors.request.use(function (config) {
    var data;
    if (config.method.toLowerCase() === "post"  
        && !config.headers['Content-Type']
    ) {
        data = config.data;
        if (type(data) === 'object') {
            data  = qs(data);
        } 
        config.data = data;
    } 
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
}, function (error) {
    // Do something with response error
    return Promise.reject(error);
});





