/**
 * @file
 * @author zdying
 */

'use strict';

var path = require('path');
var fse = require('fs-extra');
var os = require('os');

module.exports = function copyHiiTemplate(){
    try{
        var hiipackPath = path.join(os.tmpdir(), 'emi');
        var hiipackTempldatePath = path.join(__dirname, '../../', 'tmpl/_emi');

        fse.mkdirsSync(hiipackPath);

        fse.copySync(hiipackTempldatePath, hiipackPath);
    }catch(e){
        console.error('make dir .emi/cache or .emi/code failed');
        console.error(e.message);
    }
};
