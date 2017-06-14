
var path = require("path");
var webpack = require("webpack");

var ConfigFactory = require("./base.js");

class DllFactory  extends ConfigFactory {

    constructor(emi_config, basedir, env) {
        super(emi_config, basedir, env);
        this.dll = {};
    }

    entryHandle() {
        this.config.entry = this.emi_config.library; 
        return this; 
    }

    outHandle() {
        var output = Object.assign({} ,this.emi_config.output);
        if (!output.path) {
            output.path = this._outpath(); 
        }
        if (!output.filename) {
            output.filename = this._join(this._prefixPath(), this._filename());
        }
        if (!output.publicPath) {
            output.publicPath = this._publicPath();
        }
        output.library = "__lib__[name]__";
        this.config.output  = output;
        return this;
    }

    resolveHandle() {
        var resolve = this.config.resolve; 
        var modules = resolve.modules || [];
        if (modules.length) {
            var cmd_nodepath = path.join(__emi__.root, "node_modules");
            var pro_nodepath = path.join(this.basedir, "node_modules");
            modules.splice(0,0, cmd_nodepath);
            if (!~modules.indexOf(pro_nodepath)) {
                modules.splice(0,0, pro_nodepath);
            }
            resolve.modules = modules;
        } 
        return this;
    }

    pluginHandle() {
        var outpath = this._outpath();
        if (this.env === "dev") {
            this.dll.manifestPath = "/dll/[name]-manifest.json"; //缓存
            this.config.plugins = [
                 new webpack.DllPlugin({
                    path: path.join(outpath, "/dll/[name]-manifest.json"),
                    name: "__lib__[name]__",
                    context: this.basedir
                }),
                this._dllInfoTofile({path : outpath })
            ];
        } else {

            var dllManifestPath = path.join(outpath, "/dll/[name]-manifest.json");
            this.dll.manifestPath = "/dll/[name]-manifest.json"; //缓存

            this.config.plugins = [
                new webpack.DefinePlugin({
                    'process.env': {
                        'NODE_ENV': JSON.stringify('production')
                    }
                }),
                new webpack.DllPlugin({
                    path: dllManifestPath,
                    name: "__lib__[name]__",
                    context: this.basedir
                }),
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                }),
                this._dllInfoTofile({path : outpath })
            ]
        }
        return this;
        
    }

    _dllInfoTofile(options) {
        var fs = __emi__.fs;
        var dll = this.dll;
        return function () {
            this.plugin("emit", function (compilation, callback) {
                var chunks = compilation.namedChunks;
                var dll_files_info = {};
                var firstname ;
                Object.keys(chunks).forEach(function (name) {
                    if (!firstname ) {
                        firstname = name; 
                    }
                    dll_files_info[name] = chunks[name].files;
                });
                var dllFilesPath = path.join(options.path, "/dll/files.json"); 
                var fp = "/dll/files.json";
                fs.writeFileSync(dllFilesPath, JSON.stringify(dll_files_info));
                log.debug("write dll files info to :", dllFilesPath);
                dll.manifestPath = dll.manifestPath.replace(/\[name\]-manifest\.json$/, firstname + "-manifest.json");
                dll.filesPath  = fp ;
                callback();
            });
        }
    }

    getBuildDllInfo () {
        return this.dll;    
    }

    getConfig () {
        this.entryHandle()
            .outHandle()
            .resolveHandle()
            .pluginHandle();
        return this.config;
    }

}


module.exports = DllFactory;
