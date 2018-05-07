var path = require('path');
var commonConfig = require('./webpack.common.config');
var CopyWebpackPlugin = require('copy-webpack-plugin')
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var output = {
    path: path.resolve(__dirname, 'build'),
    publicPath: 'http://www.example.com/build/',
    filename: 'bundle.js'
};

module.exports = Object.assign(commonConfig, {
    output: output,
    plugins: [
        new CopyWebpackPlugin([{
            from: './js/Recorderjs/',
            to: './'
        }], {
            debug: true
        })
    ]
});