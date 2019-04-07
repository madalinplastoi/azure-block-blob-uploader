var gulp = require('gulp');
var runSequence = require('run-sequence');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var paths = require('../paths');
var assign = Object.assign || require('object.assign');
var notify = require('gulp-notify');
var browserSync = require('browser-sync');
var typescript = require('gulp-typescript');
var htmlmin = require('gulp-htmlmin');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');

var typescriptCompiler = typescriptCompiler || null;

var jsOutputDir = paths.output.src;
gulp.task('build-system', function () {
    if (!typescriptCompiler) {
        typescriptCompiler = typescript.createProject('tsconfig.json', {
            "typescript": require('typescript')
        });
    }

    return gulp.src(paths.source)
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(typescriptCompiler())
      .pipe(sourcemaps.write('.', { includeContent: false }))
      .pipe(gulp.dest(paths.sourceRoot));
});

// copies changed css files to the output directory
var cssOutputDir = paths.output.root + 'css/';
gulp.task('build-css', function () {
    return gulp.src(paths.css)
      .pipe(changed(cssOutputDir, { extension: '.css' }))
      .pipe(cssmin())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(cssOutputDir))
      .pipe(browserSync.stream());
});

// this task calls the clean task (located
// in ./clean.js), then runs the build-system
// and build-html tasks in parallel
// https://www.npmjs.com/package/gulp-run-sequence
gulp.task('build', function (callback) {
    return runSequence(
      'clean',
      ['build-system'],
      callback
    );
});
