
var expect = require('chai').expect;
require('../../../src/bootstrap/global.js')
var css = require('../../../src/compiler/utils/cssLoaders.js');

var path = require('path');

var basedir = process.cwd();


describe('Css Loader Test', function() {

    it(' 检查Config 是否 merge 正确', function() {
        var options =  {
            sass :  {
                includePaths : [path.resolve(__dirname, "./node_modules/compass-mixins/lib")] 
            },
            vue : true
        }
        var rs =  css.cssLoader(options);
        console.log(rs.sass[3].options);
    });

});
