/**
 * 全局对象
 * 
 */
var path = require("path");
var os = require('os');
var fs = require('fs');
var program = require('commander');
var child_process = require("child_process");


var log = require('../helpers/log');



var __emi__ = {
    /**
     * 全局模块跟目录
     */
    globalRoot: child_process.execSync('npm root -g').toString().trim(),
    /**
     * 工具根目录
     */
    root: path.join(__dirname, '../../'),
    /**
     * 当前工作目录
     */
    cwd: process.cwd(),

    fs : null
}


global.log = log;
global.program = program;
global.__emi__ = __emi__;
global.emiUtils = require("./globalUtils.js");

module.exports = __emi__;
