


module.exports = {
    library : {
    
    },
    entry : {
    
    },
    htmlMode : "inject",
    entryHtml : [
           filename: 'index.html',
      template: 'index.html',
    ],
    cssLoader : {
        extract : true,
        extension: ["css","scss"]
        filename : ""
    }
    pathMap : {
        dev : {
            assetsPath :
            publicPath :
        },
        prd : {
            assetsPath :
            publicPath :
        }
    },
    
}
