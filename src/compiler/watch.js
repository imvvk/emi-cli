

var fs = require("fs-extra");
var config = require("../bootstrap/config.js");
var compiler = require("./compiler.js");
var compilerUtils = require("./utils.js");
var MemoryFS = require("memory-fs");

module.exports = function (isMemory) {
    var pc = config.getProject();
    var env = "dev";
    var fs;
    if (isMemory) {
        fs = new MemoryFS();
        __emi__.fs = fs;
    } 
    compiler.compileWatcher(pc.config, __emi__.cwd, env, fs);

}

