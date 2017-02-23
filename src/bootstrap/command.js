

module.exports = {

    start : { 
        exec : function (port) {
        
        },
        options : function () {
        
        },
        usage : function () {
            return "emi start -p <port>"
        },
        help : function () {
            return  "启动一个本地wepack 服务器" 
        }
    },

    pack : {
        exec: function() {
         
        },
        options : function () {
        
        },
        usage : function () {
        
        },
        help : function () {
            return  "打包工程项目DEV 环境， 不压缩混淆" 
        }
    },

    build : {
        exec :  function () {
             
        },
        options : function () {
        
        } 
    
    },

    clean : {
        exec : function () {
        
        },
        options : function () {
            return []; 
        }
    }

}
