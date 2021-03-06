const gulp = require('gulp');
const postcss = require('gulp-postcss');
const plumber = require('gulp-plumber');
const tailwindcss = require('tailwindcss');
const atImport = require('postcss-easy-import');
const purgecss = require('gulp-purgecss')
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const stylelint = require('stylelint');
const reporter = require('postcss-reporter');
const size = require('gulp-size');
const notify = require('gulp-notify');

const tailwind = 'tailwind.js';
const mainCss = './srcCSS/main.css';
const baseThemeHtml = '../linode-hugo-base-theme/layouts/**/*.html';
const css = './srcCSS/**/*.css';
const html = './layouts/**/*.html'
const output = 'static/assets/css/';

class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:\/]+/g) || [];
  }
}

const plugins = [
  atImport,
  tailwindcss('./tailwind.js'),
  autoprefixer({
    browsers: ['last 2 versions', '> 2%']
  }),
  cssnano({
    preset: ['default', {
      discardComments: {
          removeAll: true,
      },
    }]
  })
];

gulp.task('lint', () => {
  return gulp.src('./srcCSS/**/*.css')
    .pipe(postcss([
      stylelint(), 
      reporter(),
    ]));
});

gulp.task('compile', () => {
  const s = size();
  return gulp.src(mainCss)
    .pipe(plumber())
    .pipe(postcss(plugins))
    .pipe(
      purgecss({
        content: [html],
        whitelist: ['mobile-nav', 'active', 'error'],
        extractors: [
          {
            extractor: TailwindExtractor,
            extensions: ["html"]
          }
        ]
      })
    )
    .pipe(gulp.dest(output))
});

gulp.task('size', () => {
  const s = size();
  return gulp.src(mainCss)
    .pipe(plumber())
    .pipe(postcss(plugins))
    .pipe(
      purgecss({
        content: [baseThemeHtml, html],
        whitelist: ['mobile-nav', 'active'],
        extractors: [
          {
            extractor: TailwindExtractor,
            extensions: ["html"]
          }
        ]
      })
    )
    .pipe(s)
    .pipe(notify({
			onLast: true,
      message: () =>
      `Compiled!\nCSS bundle size: ${s.prettySize}`
		}));
});

gulp.task('watch:css', () => {
  gulp.watch(css, gulp.series('compile'));
});

gulp.task('watch:html', () => {
  gulp.watch(html, gulp.series('compile'));
});

gulp.task('watch:tailwind', () => {
  gulp.watch(tailwind, gulp.series('compile'));
});

gulp.task('default', gulp.series('lint', 'compile', 'size'));
gulp.task('watch', gulp.series('compile', 'watch:css', 'watch:html', 'watch:tailwind'));