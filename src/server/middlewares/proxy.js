
var proxyMiddleware = require('http-proxy-middleware');

module.exports  =function (app, basedir, config) {
    // proxy api requests
    if (config.proxyTable) {
        var proxyTable = config.proxyTable;
        Object.keys(proxyTable).forEach(function (context) {
            var options = proxyTable[context]
            if (typeof options === 'string') {
                options = { target: options }
            }
            app.use(proxyMiddleware(options.filter || context, options))
        });
    }
}
