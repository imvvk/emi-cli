
var shell = require('shelljs');
var path = require("path");

module.exports = createCmd;

function createCmd(cmd, cb) {

    var proc = shell.exec(cmd, {
        async : true
    });

    proc.on('data', (data) => {
        console.log(cmd + ' running msg:', data);
    });

    proc.on("close",  (data) => {
        console.log('close cmd : ', cmd);
        cb && cb(data);
    });

    proc.on("exit", (data) => {
        console.log('exit cmd : ', cmd  );
    });
    return proc;
}
