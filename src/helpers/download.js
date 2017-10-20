var path = require("path");
var os = require("os");
var fs = require("fs");
var fse = require("fs-extra");
var colors = require('colors');
var download = require('download');
var envConfig = require("../helpers/config.js");

function downloadGit(gitpath, dest, options ,callback) {
    if (typeof options === "function") {
        callback = options;
        options = {}; 
    }
    var git =envConfig.get("git");
    if (!git.match(/\/$/)) {
        git +="/";
    }
    var gitUrl = git+gitpath+ '/repository/archive';
    if (options.checkout) {
        gitUrl += '?ref='+options.checkout;
    }
    download(gitUrl, dest , { extract: true, strip: 1, mode: '666', headers: { accept: 'application/zip' } }).then(function (err) {
        if (callback) {
            callback(); 
        }
    }).catch(function (err) {
        console.log(err);
    });
}

function rmGit(dest) {
    var rs = fse.removeSync(path.join(dest, "./.git"));
}

function replaceProjectName(dest, name, reg) {
    if (!reg) {
        reg = /PROJECT_NAME/gm;
    }
    var package = fs.readFileSync(path.join(dest, "./package.json"));

    if (package) {
        package = package.toString();
        package = package.replace(reg, name);
        fs.writeFileSync(path.join(dest, "./package.json"), package);
    }
}

module.exports = {
    gitclone :  downloadGit,
    replaceProjectName : replaceProjectName
}
 
