const CompressionWebpackPlugin = require('compression-webpack-plugin');
module.exports = {
    parallel: true,
    publicPath: './',
    productionSourceMap: false,
    chainWebpack: config => {
        config.cache(true);
        return {
            plugins: [
                new CompressionWebpackPlugin({
                    filename: '[path].gz[query]',
                    algorithm: 'gzip',
                    test: new RegExp(
                        '\\.(' + ['html', 'js', 'css'].join('|') + ')$'
                    ),
                    threshold: 10240,
                    minRatio: 1,
                    deleteOriginalAssets: false
                })
            ],
        }
    }
};