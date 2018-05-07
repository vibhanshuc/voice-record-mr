var ProvidePlugin = require('webpack').ProvidePlugin;
var path = require('path');

module.exports = {
    entry: [
        './js/app.js'
    ],
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            loader: 'babel'
        }, {
            test: /\.html$/,
            loader: 'file?name=[name].[ext]'
        }]
    },
    resolve: {
        extensions: ['', '.js', '.css']
    }
};
