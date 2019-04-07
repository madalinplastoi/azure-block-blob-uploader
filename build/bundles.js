var paths = require('./paths');

var bundles = [
    {name: 'ui-common.js', src: [paths.sourceRoot + 'common/' + '*.js'], dest: paths.output.src},
    {name: 'ui-models.js', src: [paths.sourceRoot + 'models/' + '*.js'], dest: paths.output.src},
    {name: 'ui-proxies.js', src: [paths.sourceRoot + 'proxies/' + '*.js'], dest: paths.output.src},
    {
        name: 'media-upload.js',
        src: [paths.sourceRoot + 'components/uploadMediaWebc/' + '*.js', paths.sourceRoot + 'components/mediaWebc/' + '*.js'],
        dest: paths.output.src
    },
];

module.exports = {
    items: bundles
};
