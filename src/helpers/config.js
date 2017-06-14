/**
 * copy form  hiipack
 * @author zdying
 */

'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');

var emirc_path = path.resolve(process.env.HOME || process.env.USERPROFILE, '.emirc');

var _config = null;

module.exports = {
    list: function(){
        console.log(this.readFileToString());
    },

    set: function(key, val){
        if(key){
            var obj = this.get();

            if(val === undefined){
                log.warn('value is', '`undefined`'.bold.yellow, 'and the', ('`' + key + '`').bold.green + '\'s', 'value will be empty');
            }

            obj[key] = val || '';

            log.debug('emi-cli config - set', key, val);
            log.debug('emi-cli config - result', JSON.stringify(obj));

            _config = obj;

            this.writeConfigFile(obj);
        }else{
            log.error('a key is required when use', '`set`'.bold.red, 'command')
        }
    },

    get: function(key){
        var config = _config || (_config = this.readFileToObject());

        return key ? config[key] : config;
    },

    delete: function(key){
        if(key){
            var obj = this.get();

            delete obj[key];

            log.debug('emirc config - delete', key);
            log.debug('emirc config - result', JSON.stringify(obj));

            _config = obj;

            this.writeConfigFile(obj);
        }else{
            log.error('a key is required when use', '`delete`'.bold.red, 'command')
        }
    },

    writeConfigFile: function(config){
        var str = [];

        for(var key in config){
            str.push(key + '=' + config[key]);
        }

        str = str.join('\n');

        log.debug('emirc config - write config to .emirc', str.replace(/\n/g, '\\n').bold);

        fs.writeFile(emirc_path, str, function(err){
            if(err){
                log.error(err)
            }
        })
    },

    readFileToString: function(){
        try{
            var txt = fs.readFileSync(emirc_path, 'utf-8').trim();
        }catch(e){
            var txt = '';
        }

        log.debug('emirc config - .emirc content:', txt.bold);

        return txt
    },
    
    readFileToObject: function(){
        var obj = {};
        var txt = this.readFileToString();
        var arr = txt && txt.split(/\n/);

        if(arr && arr.length){
            arr.forEach(function(line){
                var kv = line.split(/\s*=\s*/);
                obj[kv[0]] = kv[1] || '';
            });
        }

        log.debug('emirc config object - ', JSON.stringify(obj));
        return obj;
    }
};

