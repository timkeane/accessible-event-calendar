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
        {from: './example.html'},
        {from: './package.json'}
      ]
    })
  ],
  module: {
    rules: [{
      test: /.s?css$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
    }]
  },
  optimization: {
    minimizer: [
      `...`,
      new CssMinimizerPlugin()
    ]
  }
}
