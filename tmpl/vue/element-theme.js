var et = require('element-theme-extend');

// watch mode
et.watch({
    browsers: ["ie > 9", "last 2 versions"],
    config: './src/theme/element-variables.css', // 指定参数文件
    theme: './src/theme/', // 指定主题源文件位置
    // watch: [ './src/theme/src/**' ],
    watchFiles: [ './src/theme/src/**' ], // 监听指定文件变化
    out: './src/theme/dist', // 主题输出位置
    minimize: true, // 是否压缩代码
    // components: [ "button", "input", "menu", "sub-menu" ] // 只生成指定模块
});

// build
// et.run({
//     browsers: ["ie > 9", "last 2 versions"],
//     config: './src/scss/element-variables.css',
//     out: './src/scss/element-theme',
//     watch: './element-theme.js',
//     minimize: false,
//     components: [ "button", "input", "menu" ],
// });
