
var expect = require('chai').expect;
require('../../../src/bootstrap/global.js')
var DLL = require('../../../src/compiler/webpack/dll.js');

var emiConfig = require("../../emi.config.js");

var basedir = process.cwd();



describe('Dll Wepack Config ', function() {

    it(' config 文件', function() {
        var base = new DLL(emiConfig, basedir, 'prd');
        console.log(base.getConfig());
    });

});
