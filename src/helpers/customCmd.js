
var shell = require('shelljs');
var path = require("path");

var ended = false;
var cmdList = [];


module.exports = createCmd;

process.on('close', function(){
    end();
});



function end() {

    if (ended || !cmdList.length) {
        return;
    }

    
    log.info('stop common list ... ');

    cmdList.forEach((proc) => {
        proc.exit();
    });

    ended = true;
    cmdList = [];
    log.info('stop common success ... ');

}


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
    cmdList.push(proc);
    return proc;
}
