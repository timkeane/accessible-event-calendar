const { merge } = require('webpack-merge')
const unmini = require('./webpack.unmini.config.js')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports =  merge(unmini,{
  devtool: 'source-map',
  output: {
    filename: 'js/calendar.min.js'
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {from: './src/css/calendar.css', to: 'css/calendar.min.css'},
      ]
    })
  ],
  module: {
    rules: [{
      test: /.css$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader']
    }]
  },
  optimization: {
    minimize: true,
    minimizer: [
      `...`,
      new CssMinimizerPlugin()
    ]
  }
})
