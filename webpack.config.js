const path = require('path');

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'calendar.js',
    path: path.resolve(__dirname, 'dist')
  }
};