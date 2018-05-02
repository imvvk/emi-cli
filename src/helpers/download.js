var path = require("path");
var os = require("os");
var fs = require("fs");
var fse = require("fs-extra");
var colors = require('colors');
var download = require('download');
var childProcess = require('child_process');
var envConfig = require("../helpers/config.js");

function getGitUrl(gitpath, options) {
    var git =envConfig.get("git");
    if (!git.match(/\/$/)) {
        git +="/";
    }
    var gitUrl ;
    if (~git.indexOf('github')) {
        var version = 'master';
        if (options.checkout) {
            version = options.checkout;
        }
        gitUrl = git + gitpath + '/archive/'+version+'.zip'; 
    } else {
        gitUrl = git+gitpath+ '/repository/archive';
        if (options.checkout) {
            gitUrl += '?ref='+options.checkout;
        }
    }
    return gitUrl;
}

function downloadGit(gitpath, dest, options ,callback) {
    if (typeof options === "function") {
        callback = options;
        options = {}; 
    }
    var gitUrl = getGitUrl(gitpath, options); 
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

function npmGitInstall(gitpath, options) {
    if (typeof options === "function") {
        callback = options;
        options = {}; 
    }
    var gitUrl = getGitUrl(gitpath, options); 
    
    log.info("command : npm install -s "+ gitUrl);
    var proc = childProcess.exec('npm install -s '+ gitUrl, function(err) {
        if (err) {
            console.log(err);
            return;
        }
        log.info("install completed ");
    });
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
}

module.exports = {
    gitclone :  downloadGit,
    replaceProjectName : replaceProjectName,
    npmGitInstall : npmGitInstall
}
 
