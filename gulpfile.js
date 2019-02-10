"use strict";

// Load plugins
const browsersync = require("browser-sync").create();
const del = require("del");
const { src, dest, watch, parallel, series } = require('gulp');
const cache = require('gulp-cache');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const rename = require("gulp-rename");
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const pug = require('gulp-pug');

// Define paths
var paths = {
    base: {
        base: './',
        node: 'node_modules'
    },
    src: {
        base: './',
        html: 'src/**/*.html',
        sass: 'src/sass/**/*.sass',
        css: 'src/css/**/*.css',
        js: 'src/scripts/**/*.js',
        cssdir: 'src/css',
        img: 'src/images',
        fonts:'src/fonts',
        pug:'src/**/*.pug'
    },
    dist: {
        base: './dist',
        css: 'dist/css',
        js: 'dist/js',
        img:'dist/images'
    }
};

// BrowserSync
function browserSync(done) {
  browsersync.init({
    notify: false,
    server: {
      baseDir: paths.dist.base
    },
    reloadOnRestart: true,
    open: true,
    injectChanges: true,
    port: 3000
  });
  done();
}

// BrowserSync Reload
function reload(done) {
  browsersync.reload();
  done();
}

// clear dist folder
function clear() {
  return del([paths.dist.base]);
}


function copyPug(done){
  src(paths.src.pug)
  .pipe(pug({
    pretty: true
  }))
  .on('error', function (err) {
    process.stderr.write(err.message + '\n');
    this.emit('end');
  })
  .pipe(dest(paths.dist.base));
  done();
}

function images(done) {
  src(paths.src.img+'/*').pipe(dest(paths.dist.img));
  done();
}

function imagesMin(done) {
  src(paths.src.img+'/*')
    .pipe(
      cache(
        imagemin({
          gif: {
            interlaced: true
          }
        })
      )
    )
    .pipe(dest(paths.dist.img));
  done();
}

function fonts(done) {
  src('src/fonts/*').pipe(dest('dist/fonts'));
  done();
}

// CSS task
function css() {
  return src(paths.src.sass)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(concat('main.min.css'))
    .pipe(sourcemaps.write({ includeContent: false }))
    .pipe(plumber.stop()) 
    .pipe(dest(paths.dist.css))
    .pipe(browsersync.stream());
}

// JS
function js() {
  return src(paths.src.js)
    .pipe(concat('index.js'))
    .pipe(rename({
      basename: 'main',
      suffix: '.min'
    }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '../../'}))
    .pipe(dest(paths.dist.js));
}

// Optimize JS
function optimizeJS() {
  return src(paths.src.js)
    .pipe(concat('index.js'))
    .pipe(uglify())
    .pipe(rename({
      basename: 'main',
      suffix: '.min'
    }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '../../'}))
    .pipe(dest(paths.dist.js));
}

// Watch files
function watchFiles() {
  watch(paths.src.pug, series(copyPug, reload));
  watch(paths.src.sass, series(css, reload));
  watch(paths.src.js, series(js, reload));
}

// Complex tasks
// gulp dev
exports.dev = series(clear, copyPug, parallel(images, css, fonts, js), parallel(watchFiles, browserSync));
// gulp build
exports.build = series(clear, copyPug, imagesMin, css, fonts, optimizeJS);
// gulp clean
exports.clean = clear;
// gulp
exports.default = series(clear, parallel(watchFiles, browserSync));