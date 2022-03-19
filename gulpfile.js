const { src, dest, watch, series, parallel } = require('gulp');
const del = require('del');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();

const projectPath = '.';

const clean = () => del(`${projectPath}/build/`);
const cleanimg = () => del([`${projectPath}/build/img/**/*.{png,jpg,svg}`, `!${projectPath}/build/img/**/sprite.svg`]);
const cleansvg = () => del(`${projectPath}/build/img/**/inline-*.{png,jpg,svg}`);

const copy = () => {
  return src([
    `${projectPath}/source/fonts/**/*.{woff,woff2}`,
    `${projectPath}/source/img/**/*.{png,jpg,svg}`,
    `${projectPath}/source/video/**/*.mp4`,
    `!${projectPath}/source/img/**/inline-*.svg`,
    `${projectPath}/source//*.ico`
  ], {
    base: `${projectPath}/source`
  })
    .pipe(dest(`${projectPath}/build`));
};

const copybuild = () => {
  return src([
    `${projectPath}/source/fonts/**/*.{woff,woff2}`,
    `${projectPath}/source/video/**/*.mp4`,
    `${projectPath}/source//*.ico`
  ], {
    base: `${projectPath}/source`
  })
    .pipe(dest(`${projectPath}/build`));
};

const copyimg = () => {
  return src([
    `${projectPath}/source/img/**/*.{png,jpg,svg}`,
    `!${projectPath}/source/img/**/inline-*.svg`
  ], {
    base: `${projectPath}/source`
  })
    .pipe(dest(`${projectPath}/build`));
};

const css = () => {
  return src(`${projectPath}/source/sass/style.scss`)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(`${projectPath}/build/css`))
    .pipe(browserSync.stream());
};

const html = () => {
  return src(`${projectPath}/source/*.html`)
    .pipe(dest(`${projectPath}/build/`));
};

const imgmin = () => {
  return src(`${projectPath}/source/img/**/*.{png,jpg,svg}`)
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 90, progressive: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.svgo()
    ]))
    .pipe(dest(`${projectPath}/build/img`));
};

const imgwebp = () => {
  return src(`${projectPath}/source/img/**/content-*.{png,jpg}`)
    .pipe(webp({ quality: 90 }))
    .pipe(dest(`${projectPath}/build/img`));
};

const sprite = () => {
  return src(`${projectPath}/source/img/inline-*.svg`)
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename('sprite.svg'))
    .pipe(dest(`${projectPath}/build/img`));
};

const mainjs = () => {
  return src(`${projectPath}/source/js/*.js`)
    .pipe(dest(`${projectPath}/build/js`));
};

const server = () => {
  browserSync.init({
    server: {
      baseDir: `${projectPath}/build/`,
    },
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  watch(`${projectPath}/source/sass/**/*.scss`, css);
  watch(`${projectPath}/source/*.html`, series(html, reload));
  watch(`${projectPath}/source/img/**/*.{png,jpg,svg}`, series(cleanimg, copyimg, reload));
  watch(`${projectPath}/source/img/inline-*.svg`, series(sprite, reload));
  watch(`${projectPath}/source/js/*.js`, series(mainjs, reload));
};

const reload = (done) => {
  browserSync.reload();
  done();
};

exports.clean = clean;
exports.cleanimg = cleanimg;
exports.cleansvg = cleansvg;

exports.copy = copy;
exports.copybuild = copybuild;
exports.copyimg = copyimg;

exports.css = css;
exports.html = html;
exports.imgmin = imgmin;
exports.imgwebp = imgwebp;
exports.sprite = sprite;
exports.mainjs = mainjs;

exports.server = server;
exports.reload = reload;

exports.start = series(
  clean,
  copy,
  css,
  html,
  imgwebp,
  sprite,
  mainjs,
  server,
);

exports.build = series(
  clean,
  copybuild,
  css,
  html,
  imgmin,
  imgwebp,
  sprite,
  cleansvg,
  mainjs,
);
