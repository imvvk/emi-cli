
require("./global.js");
require("colors");

//command
var _ = require("lodash");
var package = require('../../package.json');
var program = require('commander');
var command = require("./command.js");

program
    .version(package.version, '-v, --version')
    .option('-o, --open [open]', 'open in browser, one of: chrome|firefox|safari|opera', /^(chrome|firefox|safari|opera)$/)
    .option('-p, --port <port>', 'service port', 9000)
    .option('-q, --quite', 'webpack compile quiet')
    .option('-d, --debug', 'print debug log')
    .option('-D, --detail', 'print debug and error detail log')
    .option('-t, --type <type>', 'project type: one of react|react-redux|es6|vue|normal|empty', /^(react|react-redux|es6|vue|normal|empty)$/, 'normal')
    .option('--no-color', 'disable log color')
    .option('--log-time', 'display log time')
    .option('--https', 'start https server')
    .option('--ssl-key <sslKey>', 'ssl key file')
    .option('--ssl-cert <sslCert>', 'ssl cert file')
    .option('--ca-name <caName>', 'CA name, for command: `ssl create-cert`|`ssl create-root-ca`')
    .option('--sub-domains <subDomains>', 'sub domians, for command: `ssl create-cert`')
    .option('--grep <grepContent>', 'grep log: debug|access|info|error|warn|detail|<Any other string>');


program
    .command('init <project-name> [template-name]')
    .description('generate a new project from a template')
    .action(function(name, template){
        if (!template) {
            template = "normal";
        }
        if (template.match(/^(vue|vue1|react|react-redux|normal|empty)$/)) {
            command.init.exec(template, name);
        } else {
            log.error("template-name not exist, it must be vue|vue1|react|react-redux|normal|empty");
        }

    });



program
    .command('start')
    .description('create a local webpack dev server ')
    .action(function(){
        
        var config = require("./config.js");
        if(config.load()) {
            var port = program.port
            command.server.exec.apply(this, [port]);
        }
    });

program
    .command('pack')
    .description('pack project not  uglify like development')
    .action(function(){
        __emi__.env = "dev";
        var config = require("./config.js");
        if(config.load()) {
            command.pack.exec(); 
        }
    });


program
    .command('build')
    .description('min project like production ')
    .action(function(name){
        __emi__.env = "prd";
        var config = require("./config.js");
        if (config.load()) {
            command.pack.exec(true); 
        }
    });

if(process.argv.length == 2){
    showHelp();
}

program.on('--help', function(){
    showHelp();
});


function showHelp() {
    console.log('  Examples:');
    console.log('');
    console.log('    $ emi init project_name <template-name>');
    console.log('    $ emi start');
    console.log('    $ emi start -p 9900');
    console.log('    $ emi pack');
    console.log('    $ emi build');
    console.log('');

}



program.parse(process.argv);
