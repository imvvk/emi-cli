
var _ = require("lodash");
var merge = require("webpack-merge");


function getName(ins) {
    let name = ins.constructor && ins.constructor.name;
    if (name === 'HappyPlugin') {
        return ins.id;
    } else if (name === 'CommonsChunkPlugin') {
        return JSON.stringify(ins.chunkNames);
    }
    return name;
}

var custom = {
    customizeArray(a, b, key) {
        if (key === 'plugins') {
            a = a ||[];
            b = b || [];
            for (let i=0, l = a.length; i<l; i++) {
                let ins1 = a[i];
                let name1 = getName(ins1);
                for (let j=0, h = b.length; j<h; j++ ) {
                    let ins2 = b[j];
                    let name2 = getName(ins2);
                    if (name1 === name2) {
                        a[i] = ins2;
                        b.splice(j,1);
                        j--;
                        h--;
                        break;
                    }
                }
            }
            if (b.length) {
                a = a.concat(b);
            }
            return a;
        }
        return;
    },
    customizeObject(a, b, key) {
        if (key === 'output') {
            return _.merge({}, a, b);
        }
        return ;
    }
}

module.exports = function(defConfig, config, outConfig) {
    return merge(custom)(defConfig, config, outConfig);
}

