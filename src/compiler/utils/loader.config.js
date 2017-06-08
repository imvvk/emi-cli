
{
    rules : [
        {
            test : "\.css$"  ,
            exclude 
             
        }
    ]
}


css-loader?-autoprefixer


var loaders = ['css?-autoprefixer', 'postcss', 'less'];

var sourceLoader = loaders.map(function (loader) {
      var extraParamChar
      if (/\?/.test(loader)) {
        loader = loader.replace(/\?/, '-loader?')
        extraParamChar = '&'
      } else {
        loader = loader + '-loader'
        extraParamChar = '?'
      }
      return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '')
    }).join('!')
