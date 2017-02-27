
var server = require("../server/server.js");
var pack = require("../compiler/pack.js");
var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
var inquirer = require('inquirer');

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

    clean : {
        exec : function () {
        
        }
    }

}
