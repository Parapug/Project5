const gulp = require("gulp");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const babel = require("gulp-babel");
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const plumber = require('gulp-plumber');

//a task to compile sass
gulp.task("styles", () => {
	return gulp.src("./dev/styles/**/*.scss")
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass().on("error", sass.logError))
		.pipe(autoprefixer('last 2 versions', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
		.pipe(concat("style.css"))
		.pipe(cleanCSS({debug: true}, function(details) {
		      console.log(details.name + ': ' + details.stats.originalSize);
		      console.log(details.name + ': ' + details.stats.minifiedSize);
		    }))
		.pipe(sourcemaps.write())
		.pipe(plumber.stop())
		.pipe(gulp.dest("./public/styles"))
		.pipe(reload({stream: true}));
});


//task to compile js
gulp.task("scripts", () => {
	return gulp.src("./dev/scripts/**/*.js")
		.pipe(plumber())
		.pipe(sourcemaps.init())
			.pipe(babel({
				presets: ["es2015"]
			}))
		.pipe(sourcemaps.write())
		.pipe(plumber.stop())
		.pipe(gulp.dest("./public/scripts"))
		.pipe(reload({stream: true}));
});

//task to watch other tasks
gulp.task('watch', () => {
  gulp.watch('./dev/styles/**/*.scss', ['styles']);
  gulp.watch('./dev/scripts/main.js', ['scripts']);
  gulp.watch('*.html', reload);
});

gulp.task('browser-sync', () => {
  browserSync.init({
    server: '.'  
  })
});

gulp.task('default', ['browser-sync','styles', 'scripts', 'watch']);