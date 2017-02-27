/***
 * exports to global 
 * use in emi.config.js
 ***/

var compilerUtils = require("../compiler/utils.js");

var Utils = {
    
    filename : function (ext) {
        var prefix = "";
        if (ext === "css") {
            prefix = "styles";
        } else {
            prefix = "scripts" 
        }
        if (__emi__.env === "prd") {
            return prefix + "[name]." + ext; 
        } else {
            return prefix + "[name].[chunkhash]." + ext; 
        }
    },
    cssLoader : function (options)  {
        return compilerUtils.cssLoader(options, __emi__.env);
    },

    assetPath : function (filname) {
        return filename; 
    },

    getEnv : function () {
        return __emi__.env; 
    }

}

module.exports = Utils;
