



function _cssLoader (options, env) {
    
    options = options || {}
    if (env !== "prd") {
        options.sourceMap = true; 
    }

    var cssLoader = {
        loader: 'css-loader',
        options: {
            minimize: env == "prd",
            sourceMap: options.sourceMap
        }
    }
    var fallback_loader = options.vue ? "vue-style-loader" : "style-loader";
    // generate loader string to be used with extract text plugin
    function mergeOpts(loader, loaderOptions) {
        var _opts ;
        if (loader === "postcss") {
            _opts = loaderOptions || {
                plugins : function () {
                    return [
                        require("autoprefixer")
                    ]
                }
            };
        } else {
            _opts = Object.assign({}, loaderOptions, {
                sourceMap: options.sourceMap
            });
        }
      

        return {
            loader: loader + '-loader',
            options: _opts
        }
    }
    function generateLoaders (loader, loaderOptions) {
        var loaders = [cssLoader]
        if (loader !== "postcss") {
            loaders.push(mergeOpts("postcss",  options.postcss));
        }
        if (loader) {
            loaders.push(mergeOpts(loader, loaderOptions));
        }
        // Extract CSS when that option is specified
        // (which is the case during production build)
        if (options.extract) {
            return ExtractTextPlugin.extract({
                use: loaders,
                fallback: fallback_loader
            });
        } else {
            return [ fallback_loader ].concat(loaders)
        }
    }

    // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
    return {
        css: generateLoaders(),
        postcss: generateLoaders("postcss", options.postcss),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', Object.assign({ indentedSyntax: true }, options.sass)),
        scss: generateLoaders('sass', Object.assign({}, options.sass)),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    }
