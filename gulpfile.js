/*global require*/
"use strict";

var gulp = require('gulp'),
  path = require('path'),
  data = require('gulp-data'),
  pug = require('gulp-pug'),
  prefix = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
  del = require('del');
  var paths = {
    public: './public/',
    sass: './src/sass/',
    css: './public/css/',
    js: './src/scripts/',
    jsDist: './public/scripts/',
    data: './src/_data/'
  };



  gulp.task('clean:public', function() {
    return del.sync('public');
  })



  /**
   * Compile .pug files and pass in data from json file
   * matching file name. index.pug - index.pug.json
   */
  gulp.task('pug', function () {
    return gulp.src('./src/*.pug')
      .pipe(pug({
        pretty: true
      }))
      .on('error', function (err) {
        process.stderr.write(err.message + '\n');
        this.emit('end');
      })
      .pipe(gulp.dest(paths.public));
  });


  /**
   * Recompile .pug files and live reload the browser
   */
  gulp.task('rebuild', ['pug'], function () {
    browserSync.reload();
  });
  
  /**
   * Wait for pug and sass tasks, then launch the browser-sync Server
   */
  gulp.task('browser-sync', ['sass', 'pug', 'js'], function () {
    browserSync({
      server: {
        baseDir: paths.public
      },
      notify: false
    });
  });
  
  /**
   * Compile .scss files into public css directory With autoprefixer no
   * need for vendor prefixes then live reload the browser.
   */
  gulp.task('sass', function () {
    return gulp.src(paths.sass + '**/*.sass')
      .pipe(sass({
        includePaths: [paths.sass],
        outputStyle: 'compressed'
      }))
      .on('error', sass.logError)
      .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
        cascade: true
      }))
      .pipe(gulp.dest(paths.css))
      .pipe(browserSync.reload({
        stream: true
      }));
  });
  
  /**
   * Compile ES6 into ES5
   */
  gulp.task('js', function () {
    return gulp.src(paths.js + '*.js')
        .pipe(gulp.dest(paths.jsDist))
        .pipe(browserSync.reload({
          stream: true
        }));
  });

  /**
   * Compile ES6 and minify js
   */
  gulp.task('js-dist', ['js'], function () {
    gulp.src(paths.jsDist + '*.js')
      .pipe(minifyJs())
      .pipe(gulp.dest(paths.jsDist));
  });

  /**
   * Watch scss files for changes & recompile
   * Watch .pug files run pug-rebuild then reload BrowserSync
   */
  gulp.task('watch', function () {
    gulp.watch(paths.js + '**/*.js', ['js']);
    gulp.watch(paths.sass + '**/*.sass', ['sass']);
    gulp.watch('./src/**/*.pug', ['rebuild']);
  });
  
  // Build task compile sass and pug.
  gulp.task('build', ['sass', 'pug', 'js-dist']);
  
  /**
   * Default task, running just `gulp` will compile the sass,
   * compile the jekyll site, launch BrowserSync then watch
   * files for changes
   */
  gulp.task('default', ['clean:public', 'browser-sync', 'watch']);