const { merge } = require('webpack-merge')
const mini = require('./webpack.mini.config.js')
const path = require('path')

module.exports = merge(mini, {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        port: 3000,
        hot: true
    }
})
