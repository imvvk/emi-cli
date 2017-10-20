

var fs = require("fs-extra");
var config = require("../bootstrap/config.js");
var webpack = require("./webpack.js"); 

module.exports = function () {

    var watching;
    /**
    var end = () => {
        if (watching) {
            watching.close(() => {
                console.log("Watching Ended...");
            });
            watching = null;
        }
    }

    process.on('SIGINT', end);

    process.on('SIGTERM', end);

    **/

    var pc = config.getProject();
    var env = "dev";
    

    var compiler =  webpack.getInstance(pc.config, __emi__.cwd, 'dev').then(function (data) {
        var compiler = data.webpack; 
        watching = compiler.watch({
        }, (err, stats) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!program.quite) {
                process.stdout.write(stats.toString({
                    colors: true,
                    modules: false,
                    children: false,
                    chunks: false,
                    chunkModules: false
                }) + '\n\n')
            } 
        });

    });
}

