
require("./global.js");
require("colors");
var config = require("./config.js");
config.load();

//command
var package = require('../../package.json');
var program = global.program;
var command = require("./command.js");

program
    .version(package.version, '-v, --version')
    .option('-o, --open [open]', 'open in browser, one of: chrome|firefox|safari|opera', /^(chrome|firefox|safari|opera)$/)
    .option('-p, --port <port>', 'service port', 9000)
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
    .command('init <name>')
    .description('initialize project')
    .action(function(name){
        exec('init', name, program.type, program.registry);
        // client.init(name, program.type, program.registry);
    });



program
    .command('server <name>')
    .description('create a local webpack dev server ')
    .action(function(name){
        exec('server', name, program.type, program.registry);

    });


