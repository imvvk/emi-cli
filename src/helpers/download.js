var path = require("path");
var os = require("os");
var fs = require("fs");
var fse = require("fs-extra");
var colors = require('colors');
var gitclone = require("git-clone");

function download(gitpath, dest, options ,callback) {
    if (typeof options === "function") {
        callback = options;
        options = {}; 
    }
    gitclone(gitpath, dest , options, function (err) {
        if (err === undefined) {
            rmGit(dest);
            if (callback) {
                callback(); 
            }
        } else {
            console.log(err);
        }
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
    gitclone :  download,
    replaceProjectName : replaceProjectName
}
 
