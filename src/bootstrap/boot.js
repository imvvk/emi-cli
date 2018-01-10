
require("./global.js");
require("colors");

//command
var _ = require("lodash");
var package = require('../../package.json');
var program = require('commander');
var command = require("./command.js");

program
    .version(package.version, '-v, --version')
    .option('-p, --port <port>', 'service port')
    .option('-q, --quite', 'webpack compile quiet')
    .option('-d, --debug', 'print debug log')
    .option('-D, --detail', 'print debug and error detail log')
    .option('-t, --type <type>', 'project type: one of react|react-redux|es6|vue|normal|empty', /^(react|react-redux|es6|vue|normal|empty)$/, 'normal')
    .option('--dir', 'clear dir dev or dist ', 'dev')
    .option('--no-color', 'disable log color')
    .option('--log-time', 'display log time')
    .option('--https', 'start https server')
    .option('--ssl-key <sslKey>', 'ssl key file')
    .option('--ssl-cert <sslCert>', 'ssl cert file')
    .option('--ca-name <caName>', 'CA name, for command: `ssl create-cert`|`ssl create-root-ca`')
    .option('--sub-domains <subDomains>', 'sub domians, for command: `ssl create-cert`')
    .option('--grep <grepContent>', 'grep log: debug|access|info|error|warn|detail|<Any other string>');


program
    .command('init <template-name> [project-name] ')
    .description('generate a new project from a template')
    .action(function(template, name){
        if (!template) {
            log.error("template must be set , it can be 'vue|vue1|react|react-redux|normal|empty' or a git path ");
            return 
        }
        if (template.match(/^(vue|vue1|react|react-redux|normal|empty)$/)) {
            command.init.exec(template, name);
        } else  {
            command.initGit.exec(template, name);
        }

    });


program
    .command('install [component-name] ')
    .description('install a gitlab component in current project node_module')
    .option('-C, --component', 'install type is component')
    .option('-c, --component', 'install type is component')
    .action(function(component){
        var isComponent = program.component;
        command.install.exec.apply(this, [component, isComponent]);
    });

program
    .command('set [name] <value>')
    .description('set .emirc name value')
    .action(function(name, value){
        command.config.exec.apply(this, [name, value]);
    });

program
    .command('start')
    .description('create a local webpack dev server ')
    .action(function(){
        
        var config = require("./config.js");
        if(config.load()) {
            var port = program.port || 9000;
            command.server.exec.apply(this, [port]);
        }
    });


program
    .command('watch')
    .description('watch file change & build in development context')
    .action(function(){
        __emi__.env = "dev";
        var config = require("./config.js");
        if(config.load()) {
            command.watch.exec(); 
        }
    });


program
    .command('pack')
    .description('pack project not  uglify like development')
    .action(function(){
        __emi__.env = "dev";
        process.env.NODE_ENV = 'development';
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
        process.env.NODE_ENV = 'production';
        var config = require("./config.js");
        if (config.load()) {
            command.pack.exec(true); 
        }
    });

program
    .command('clean')
    .description('clean prject build dir ')
    .action(function(name){
        var config = require("./config.js");
        if (config.load()) {
            var dir = program.dir;
            command.clean.exec(dir); 
        }
    });

program
    .command('config')
    .description('show project emi.config.js content')
    .action(function(name){
        var config = require("./config.js");
        if (config.load()) {
            console.log(config.getProject().config);
        }
    });

program
    .command('proxy')
    .description('start http proxy server, default port 1337 , use -p  set other port  ')
    .option('-c, --config <path>', 'proxy config')
    .action(function(cmd){
        var port = program.port;
        var configPath = cmd.config;
        if (!configPath) {
            log.error('config path not found, please set config path use -c  /xxxx.js or --config /xxxxx.js');
        } else {
            command.proxy.exec.apply(this, [port, configPath]);
        }
    });

if(process.argv.length == 2){
    showVersion();
    showHelp();
}

program.on('--help', function(){
    showHelp();
});

function showVersion(){
    var version = package.version.magenta;
    console.log("");
    console.log("emi version :  " + version);
    console.log("");
}

function showHelp() {
    console.log('  Examples:');
    console.log('');
    console.log('    $ emi init <template-name> project_name');
    console.log('    $ emi start');
    console.log('    $ emi start -p 9900');
    console.log('    $ emi pack');
    console.log('    $ emi build');
    console.log('    $ emi watch');
    console.log('    $ emi watch --memory');
    console.log('');

}



program.parse(process.argv);
