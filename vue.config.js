const WebpackObfuscator = require('webpack-obfuscator');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

module.exports = {
    parallel: true,
    publicPath: './',
    productionSourceMap: false,
    chainWebpack: config => {
        config.cache(true);
        if (process.env.ANALYZE === 'true') {
            const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
            config.plugin('bundle-analyzer').use(BundleAnalyzerPlugin, [{ analyzerMode: 'static' }]);
        }
    },
    configureWebpack: {
        plugins: [
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
                unicodeEscapeSequence: false,
                identifierNamesGenerator: 'hexadecimal'
            }, []),
            new CompressionWebpackPlugin({
                minRatio: 1,
                test: /\.(html|js|css)$/,
                filename: '[path].gz[query]',
                algorithm: 'gzip',
                threshold: 10240,
                deleteOriginalAssets: false
            })
        ]
    }
};
