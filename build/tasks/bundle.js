var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    runSequence = require('run-sequence'),
    rev = require('gulp-rev'),
    paths = require('../paths'),
    bundles = require('../bundles'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('concat', function () {
    return bundles.items.forEach(function (obj) {
        return gulp.src(obj.src)
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(concat(obj.name))
            .pipe(sourcemaps.write('.', { includeContent: false }))
            .pipe(gulp.dest(obj.dest))
    });
});

gulp.task('dev', function (callback) {
    return runSequence(
      'build',
      ['concat'],
      callback
    );
});

gulp.task('live', ['dev'], function () {
    setTimeout(function () {
        return gulp.src([paths.output.src + '*.js'])
            .pipe(sourcemaps.init())
            .pipe(rename({ suffix: '.min' }))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.output.src));
    }, 10000);
});