/**
 * @file
 * @author zdying
 * 文件系统图标显示使用
 * 
 */

'use strict';

module.exports = function(req, res, next){
    var url = req.url.replace('__source__', '');

    this.sendFile(req, require('path').join(__dirname, '../source/', url))
};
