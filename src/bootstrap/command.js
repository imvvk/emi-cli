
var server = require("../server/server.js");
var pack = require("../compiler/pack.js");
var watch = require("../compiler/watch.js");
var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
var inquirer = require('inquirer');
var download = require("../helpers/download.js");
var envConfig = require("../helpers/config.js");

module.exports = {
    init : {
        exec : function (template, projectName) {
            var template_path = path.join(__emi__.root, "./tmpl/"+template);
            var project_path = path.join(__emi__.cwd, projectName);

            log.info("copy template " +template+ " to project " +  projectName +  "....");
            fs.stat(project_path, function (err, result) {
                if (err) {
                    fse.mkdirsSync(project_path);
                    fse.copySync(template_path, project_path); 
                    download.replaceProjectName(project_path, projectName);
                    log.info("copy template [" +template+ "] to project " +  projectName +  " end !");
                } else {
                    var files = fs.readdirSync(project_path);
                    if (!files.length) {
                        fse.copySync(template_path, project_path); 
                        log.info("copy template [" +template+ "] to project " +  projectName +  " end !");
                    } else {
                        inquirer.prompt([{ type :"confirm", "name" : "user_input", message : "project path not empty,  continue ?"}]).then(function (answers) {
                            if (answers.user_input) {
                                fse.copySync(template_path, project_path); 
                                download.replaceProjectName(project_path, projectName);
                                log.info("copy template [" +template+ "] to project " +  projectName +  " end !");
                            } else {
                                log.info("user cancel");
                            }
                            // Use user feedback for... whatever!!
                        }, function (err) {
                        });
                    }

                
                }
            })
        
        }
    }, 
    initGit :{
        exec :  function (template, projectName) {
            var emirc_path = path.resolve(process.env.HOME || process.env.USERPROFILE, '.emi_cache');
            var regx = /^git@|https?:\/\//;
            var gitpath ;
            if (template.match(regx))  {
                gitpath = template;
            } else{
                var prefix =envConfig.get("git");
                if (prefix.match(/^http/) && !prefix.match(/\/$/) && !template.match(/^\//)) {
                    template = "/"  + template;
                } 
                gitpath = envConfig.get("git") + template;    
            }
            if (!gitpath.match(/\.git$/)) {
                gitpath +=".git";
            }
            log.info("git url is:" + gitpath);
            var project_path = path.join(__emi__.cwd, projectName);
            var tmp_path = path.join(emirc_path, projectName+"_"+ new Date().getTime());
            if (fs.existsSync(emirc_path)) {
                download.gitclone(gitpath, tmp_path, function () {
                    download.replaceProjectName(tmp_path, projectName);
                    if (!fs.existsSync(project_path)) {
                          fse.mkdirsSync(project_path);
                    }
                    var files = fs.readdirSync(project_path);
                    if (!files.length) {
                        fse.copySync(tmp_path, project_path);
                        fse.remove(tmp_path);
                        log.info("create project " +  projectName +  " end !");
                    } else {
                        inquirer.prompt([{ type :"confirm", "name" : "user_input", message : "project path not empty,  continue ?"}]).then(function (answers) {
                            if (answers.user_input) {
                                fse.copySync(tmp_path, project_path);
                                fse.remove(tmp_path);
                                log.info("create project " +  projectName +  " end !");
                            } else {
                                log.info("user cancel");
                            }
                            // Use user feedback for... whatever!!
                        }, function (err) {
                        });
                    }

                });
            } else {
                log.error(".emicache path not in home dir");
            }
        }
    },
    server : { 
        exec : function (port) {
            log.info ("__emi__ work in path", __emi__.cwd);
            server.start(port);
        }
    },

    pack : {
        exec: function(isMin, isDll) {
            log.info ("__emi__ work in path", __emi__.cwd);
            pack(isMin, isDll); 
        }
    },

    watch : {
        exec : function (isMemory) {
           log.info ("__emi__ work in path", __emi__.cwd);
           watch(isMemory);
        } 
    },
    clean : {
        exec : function (type) {
            log.info ("__emi__ work in path", __emi__.cwd);
            if (type === "prd")  {
                fse.emptyDirSync(path.join(__emi__.cwd, "./dist"));
            } else {
                fse.emptyDirSync(path.join(__emi__.cwd, "./dev"));
            }
            log.info ("clean build dir success");
        }
    },
    config : {
        exec : function (name, value) {
            if (!name)  {
                log.error("emirc set must have a name");
                return ;
            }
            envConfig.set(name, value);
            log.info("set .emirc name: " +  name +  " value: " + (value || ""));

        } 
    }

}
