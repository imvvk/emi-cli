/**
* @file static.js
* @author vvk
* @date 2017-10-11
* 
* 配置文件中如果指定了 static配置 将转发到 static
* 
*/

var path = require('path');

/**
 * exports
 *
 * @param {String} basedir 项目路径
 * @param {Object} config emiConfig
 * @param {Object} webpackConfig webpackConfig
 * @return middleware
 */
module.exports = function(basedir, config, publicPath) {
    if (config.staticPath && false )  {
        var staticPath =  config.staticPath;
        var reg = new RegExp("^"+path.normalize(publicPath + staticPath));
        var publicReg = new RegExp("^"+ publicPath);
        return function (req, res, next) {
            var uri = req.path;
            if (uri.match(reg)) {
                var filePath = path.join(__emi__.cwd, path.relative(publicPath, uri));
                res.sendFile(filePath);
            } else {
                next();
            }
        }
    } else {
        return function (req, res, next) {
            next(); 
        }  
    }
}
