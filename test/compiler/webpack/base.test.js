var expect = require('chai').expect;

var Base = require('../../../src/compiler/webpack/dll.js');

var emiConfig = require("../../emi.config.js");

var basedir = process.cwd();


describe('基础Wepack Config ', function() {

    it('生成基本webpack config 文件', function() {
        var base = new Base(emiConfig, basedir, 'dev');
        console.log(base.config);
    });

});
