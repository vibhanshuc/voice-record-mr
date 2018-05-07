var path = require('path');
var commonConfig = require('./webpack.common.config');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var output = {
    path: path.resolve(__dirname, 'build'),
    publicPath: 'http://www.example.com/build/',
    filename: 'bundle.js'
};

module.exports = Object.assign(commonConfig, {
    output: output
});
