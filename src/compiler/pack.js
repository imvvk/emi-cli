

var fs = require("fs-extra");
var config = require("../bootstrap/config.js");
var compiler = require("./compiler.js");
var compilerUtils = require("./utils.js");


module.exports = function (isMin, isPackDll) {
    var time = new Date().getTime();
    log.info("build start:", time);
    var pc = config.getProject();
    var env = isMin ? "prd" : "dev";

    compiler.compile(pc.config, __emi__.cwd, env).then(function () {
            var time2 = new Date().getTime();
            log.info("build end:",time2, " spend time:", time2 - time);
    });

}
