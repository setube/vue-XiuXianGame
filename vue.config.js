const WebpackObfuscator = require('webpack-obfuscator');
// const UnicodeStringPlugin = require('./UnicodeStringPlugin.js');
module.exports = {
    parallel: true,
    publicPath: './',
    productionSourceMap: false,
    chainWebpack: config => {
        config.module
            .rule('js')
            .use('babel-loader')
            .loader('babel-loader')
            .tap(options => {
                options.cacheDirectory = true;
                return options;
            });
        config.cache(true);
    },
    configureWebpack: {
        plugins: [
            // new UnicodeStringPlugin({
            //     allowedExtensions: ['.js', '.vue'],
            //     logFile: 'extracted_strings.log' // Specify your log file name
            // })
            ...(process.env.NODE_ENV === 'production' ? [
                new WebpackObfuscator({
                    log: false,
                    compact: true,
                    stringArray: true,
                    renameGlobals: false,
                    selfDefending: false,
                    debugProtection: false,
                    rotateStringArray: true,
                    deadCodeInjection: false,
                    stringArrayEncoding: ['none'],
                    disableConsoleOutput: true,
                    stringArrayThreshold: 0.75,
                    controlFlowFlattening: false,
                    unicodeEscapeSequence: true,
                    identifierNamesGenerator: 'hexadecimal'
                }, [])
            ] : [])
        ]
    }
};
