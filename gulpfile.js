var gulp = require('gulp');
var del = require('del');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var less = require('gulp-less');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var concat = require('gulp-concat');
var html2js = require('gulp-html2js');
var replace = require('gulp-replace');
var rename = require("gulp-rename");
var runSequence = require('run-sequence');

var html2jsFileName;

gulp.task('clean', function(cb) {
  del([
    './build',
    './assets/css'
  ], cb);
});

gulp.task('less', function() {
  return gulp.src('assets/less/materialdrive.less')
    .pipe(less({
      modifyVars: {
        '@image-asset-path': '"../assets/images"',
        '@fa-font-path': '"../assets/fonts"'
      }
    }))
    .pipe(gulp.dest('assets/css'));
});

gulp.task('jshint', function() {
  return gulp.src([
      '*.js',
      'app/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('html2js', function() {
  return gulp.src('app/**/*.html')
    .pipe(html2js({
      outputModuleName: 'materialDrive.tpls',
      useStrict: true
    }))
    .pipe(concat('app.tpls.js'))
    .pipe(uglify())
    .pipe(rev())
    .pipe(rename(function(data) {
      html2jsFileName = data.basename + data.extname;
    }))
    .pipe(gulp.dest('build/js'));
});

gulp.task('copyAssets', function () {
  gulp.src('bower_components/font-awesome/fonts/*')
    .pipe(gulp.dest('build/assets/fonts'));
  gulp.src('assets/images/**')
    .pipe(gulp.dest('build/assets/images'));
  gulp.src('favicon.ico')
    .pipe(gulp.dest('build/'));
  return gulp.src(['index.html'])
    .pipe(replace('<!-- app.tpls.js -->', '<script src="js/' + html2jsFileName + '"></script>'))
    .pipe(gulp.dest('build'));
});

gulp.task('usemin', function() {
  return gulp.src('build/index.html')
    .pipe(usemin({
      css: [
        minifyCss(),
        rev()
      ],
      libjs: [
        uglify(),
        rev()
      ],
      appjs: [
        uglify(),
        rev()
      ],
      inlinejs: [
        uglify()
      ],
      inlinecss: [
        minifyCss(),
        'concat'
      ]
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('default', function(cb) {
  runSequence('build', cb);
});

gulp.task('build', function(cb) {
  runSequence('jshint', 'clean', 'less', 'html2js', 'copyAssets', 'usemin', cb);
});

gulp.task('dev', function() {
  return gulp.src('assets/less/materialdrive.less')
    .pipe(less())
    .pipe(gulp.dest('assets/css'));
});

gulp.task('watch', ['dev'], function() {
  gulp.watch('assets/less/*.less', ['dev']);
});