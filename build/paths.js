var path = require('path');

var appRoot = 'public/';
var srcRoot = 'src/';
var outRoot = 'public/dist/';
var dtsRoot = 'typings/';
var customDts = 'customTypings';

var tsSources = [
    srcRoot + '*.ts',
    srcRoot + '**/*.ts',
    srcRoot + '**/**/*.ts',
    srcRoot + '**/**/**/*.ts',
    customDts + '*.d.ts',
    dtsRoot + '**/**/*.d.ts'
];


var cleanPath = [
    srcRoot + '*.js',
    srcRoot + '**/*.js',
    srcRoot + '**/**/*.js',
    srcRoot + '**/**/**/*.js',
    srcRoot + '*.js.map',
    srcRoot + '**/*.js.map',
    srcRoot + '**/**/*.js.map',
    srcRoot + '**/**/**/*.js.map',
    outRoot,
    '!' + srcRoot + 'common/custom-bindings.js',
    '!' + srcRoot + 'common/knockout-select2.js'
];

module.exports = {
    root: appRoot,
    sourceRoot: srcRoot,
    source: tsSources,
    clean: cleanPath,
    output: {
        root: outRoot,
        src: outRoot + 'js/',
        css: outRoot + 'css/'
    }
};
