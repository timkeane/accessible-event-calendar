const path = require('path');

module.exports = {
  entry: './claendar.js',
  output: {
    filename: 'claendar.js',
    path: path.resolve(__dirname, 'dist')
  }
};