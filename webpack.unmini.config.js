const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'js/calendar.js',
    path: path.resolve(__dirname, 'dist')
  },
  externals: {
    jquery: 'jQuery',
    papaparse: 'Papa'
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {from: './data/', to: 'data/'},
        {from: './src/index.html'},
        {from: './src/example/', to: 'example/'},
        {from: './src/css/calendar.css', to: 'css/calendar.css'}
      ]
    })
  ],
  optimization: {
    minimize: false
  }
}
