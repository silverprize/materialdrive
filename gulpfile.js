var gulp = require('gulp');
var del = require('del');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var less = require('gulp-less');
var runSequence = require('run-sequence');

gulp.task('clean', function(cb) {
  del([
    './assets/css'
  ], cb);
});

gulp.task('less', function() {
  return gulp.src('./assets/less/materialdrive.less')
    .pipe(less())
    .on('error', function(err) {
      console.log(err.message);
    })
    .pipe(gulp.dest('./assets/css'));
});

gulp.task('jshint', function() {
  return gulp.src('./app/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('default', function(cb) {
  runSequence('jshint', 'clean', 'less', cb);
});