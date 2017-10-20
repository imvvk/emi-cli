
var webpack = require('webpack')

module.exports = function (manifest, emiConfig , instance) {

    return {
        plugins : [
            new webpack.DllPlugin({
                path: manifest,
                name: "__lib__[name]__",
                context : __emi__.cwd  
            })

        ]
    }

}
    

