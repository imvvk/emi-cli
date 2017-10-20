var expect = require('chai').expect;


var cmd = require('../../src/helpers/customCmd.js');


describe('custom Cmd Test ', function() {

    it('测试命令', function() {
        cmd('top');
    });
});


