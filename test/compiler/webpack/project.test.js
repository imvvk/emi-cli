
var expect = require('chai').expect;
require('../../../src/bootstrap/global.js')
var Project = require('../../../src/compiler/webpack/project.js');

var emiConfig = require("../../emi.config.js");

var basedir = process.cwd();


describe('Project Wepack Config ', function() {

    it(' config 文件', function() {
        process.env.NODE_ENV='production'
        var base = new Project(emiConfig, basedir, 'prd');
        console.log(base.getConfig());
    });

});
