#!/usr/bin/env node 

var child_process = require('child_process');
var path = require("path");
require("colors");

var spliter = path.delimiter;
var NODE_PATH = process.env.NODE_PATH;

var node_path = [ path.join(__dirname, "../node_modules") ].join(spliter) + (NODE_PATH ? spliter + NODE_PATH : '');

process.env.NODE_PATH = node_path;

var childProc =  child_process.fork( path.join(__dirname, '../src/bootstrap/boot.js'), process.argv.slice(2), {
    execArgv: []
});

process.on('SIGINT', end);

process.on('SIGTERM', end);

//delete all childprocess ....
function end () {
    if (childProc) {
        childProc.kill('SIGKILL');
        childProc = null;
    } 

    console.log('\b\b  ');
    console.log('emi-cli ended...'.bold.yellow);
}
