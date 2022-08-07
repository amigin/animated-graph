
var gulp = require('gulp');
var minifyjs = require('gulp-js-minify');
var concat = require('gulp-concat');

gulp.task('default', function () {
    return gulp
        .src(['./wwwroot/js/utils.js',
            './wwwroot/js/prices.js',
            './wwwroot/js/app-ctx.js',
            './wwwroot/js/graph-renderer.js', './wwwroot/js/main.js'])
        .pipe(minifyjs())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./wwwroot/js/'))
});