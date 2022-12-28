const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'calendar.js',
    path: path.resolve(__dirname, 'dist')
  },
  externals: {
    jquery: 'jQuery',
    papaparse: 'Papa'
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {from: './data/calendar.csv'},
        {from: './data/different-calendar.csv'},
        {from: './src/css/calendar.css'},
        {from: './example.html'},
        {from: './package.json'}
      ]
    })
  ],
  optimization: {
    minimize: false
  }
}