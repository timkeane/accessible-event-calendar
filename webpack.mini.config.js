const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports =  {
  entry: './src/js/index.js',
  devtool: 'source-map',
  output: {
    filename: 'calendar.min.js',
    path: path.resolve(__dirname, 'dist')
  },
  externals: {
    jquery: 'jQuery',
    papaparse: 'Papa'
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {from: './data/calendar.csv'},
        {from: './data/different-calendar.csv'},
        {from: './src/css/calendar.css', to: 'calendar.min.css'},
        {from: './src/css/better.css', to: 'better.min.css'},
        {from: './src/index.html', to: 'index.html'}
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
    minimizer: [
      `...`,
      new CssMinimizerPlugin()
    ]
  }
}
