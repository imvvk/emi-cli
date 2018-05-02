
const _ = require('lodash');

module.exports = parse;

function parse(hostConfig) {
    var obj = {};
    Object.keys(hostConfig).forEach((host) => {
        obj[host] = _.assign({}, hostConfig[host] , {
            rules : parseItem(hostConfig[host])
        })
    }) 

    return obj;
}


function parseItem(hostItem) {
    
    var path = hostItem.locations || '/';
    var locations = [];

    if (_.isPlainObject(path)) {
        locations = getlikeNginxPriority(path);      
    } else if (_.isString(path)) {
        if (path.charAt(0) !== '/') {
            path = '/' + path; 
        }
        if (path.length > 1) {
            locations.push({from : path, to : path, pri : 2}); 
        } else {
            locations.push({from : path, to : path, pri : 1}); 
        }
    }

    return locations;

}

/**
 * symbol      = >  ^~ > ~ >  /xxx > /    
 * priority    5    4    3     2     1
 *
 * example :
 * 
 * ~ ^/download/Custom/lego_static/(.+)\.\w+\.(gif|jpg|png|js|css)" 
 * 
 **/

function getlikeNginxPriority(path) {
    let rules = Object.keys(path).map((key) => {
        let rule = {};
        let to = path[key];
        if (key.indexOf(' ') >-1) {
            let t = key.split(' ');
            let prefix = t[0];
            let pathKey = t[1];
            if (prefix === '=') {
                rpri = 5; 
                rule.from = pathKey;
                rule.to = to;
            } else if (prefix === '^~') {
                rule.pri = 4;
                rule.from = pathKey;
                rule.to = to;
            } else if (prefix === '~') {
                rule.pri = 3; 
                rule.from = new RegExp(pathKey, 'i'); 
                rule.to = to;
            } else if (prefix === '~*') {
                rule.pri = 3; 
                rule.from = new RegExp(pathKey); 
                rule.to = to;
            } else {
                throw new Error('not match prefix'); 
            } 
        } else {
            if (key.charAt(0) !== '/') {
                key = '/' + key; 
            }
            if (key.length > 1) {
                rule.pri = 2 
            } else {
                rule.pri = 1 
            }
            rule.from = key;
            rule.to = to;
        }
        return rule;
    }).sort((a , b) => {
        return b.pri - a.pri;
    });

    return rules;

}
