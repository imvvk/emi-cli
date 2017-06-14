var fs = require("fs");
var path = require("path");

var homeDir = process.env.HOME || process.env.USERPROFILE;


try{
    var emircPath = path.join(homeDir, '.emirc');
    var emiCachePath = path.join(homeDir, ".emi_cache");
    if (!fs.existsSync(emiCachePath)) {
        fs.mkdirSync(emiCachePath);
    }
    if(!fs.existsSync(emircPath)){
        fs.writeFileSync(emircPath, [
            'registry=',
            'git='
        ].join('\n'));
    }else{
        console.log(emircPath, 'already exists, content:');
        console.log(fs.readFileSync(emircPath, 'utf8'));
    }
}catch(e){
    console.error('emi config file create failed ==>', e.message)
}
