const { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require('browser-sync').create(),
	file_include = require('gulp-file-include'),
	del = require('del'),
	sourcemaps = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	media_queries = require('gulp-group-css-media-queries'),
	clean_css = require('gulp-clean-css'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	streamify = require('gulp-streamify'),
	uglify = require('gulp-uglify-es').default,
	rename = require('gulp-rename'),
	imagemin = require('gulp-imagemin'),
	iconfont = require('gulp-iconfont'),
	iconfontCss = require('gulp-iconfont-css'),
	fontName = 'iconfont',
	sass = require('gulp-sass');

sass.compiler = require('node-sass');

const projectFolder = 'dist'
const sourceFolder = 'src'

const path = {
	build: {
		html: projectFolder + '/',
		css: projectFolder + '/css/',
		js: projectFolder + '/js/',
		img: projectFolder + '/img/',
		fonts: projectFolder + '/fonts/',
		icons: projectFolder + '/fonts/icons',
	},
	src: {
		html: [sourceFolder + '/*.html', '!' + sourceFolder + '/_*.html'],
		css: sourceFolder + '/scss/style.scss',
		js: sourceFolder + '/js/main.js',
		img: sourceFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
		fonts: sourceFolder + '/fonts/**/*.{eot,ttf,woff,woff2,svg}',
		icons: [sourceFolder + '/icons/**/*.svg', '!' + sourceFolder + '/icons/**/_*.svg'],
	},
	watch: {
		html: sourceFolder + '/**/*.html',
		css: sourceFolder + '/scss/**/*.scss',
		js: sourceFolder + '/js/**/*.js',
		img: sourceFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
		icons: sourceFolder + '/icons/**/*.svg',
	},
	clean: './' + projectFolder + '/'
}


function browserSync() {
	browsersync.init({
		open: false,
		server: {
			baseDir: './' + projectFolder + '/'
		},
		notify: false
	});
}

function html() {
	return src(path.src.html)
		.pipe(file_include())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
}

function css() {
	return src(path.src.css)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sass({ outputStyle: 'expanded' }))
		.pipe(sourcemaps.write())
		.pipe(media_queries())
		.pipe(autoprefixer())
		.pipe(dest(path.build.css))
		.pipe(clean_css())
		.pipe(sourcemaps.write())
		.pipe(rename({ extname: '.min.css' }))
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}

function js() {
	return browserify(path.src.js)
		.bundle()
		.pipe(source('main.js'))
		.pipe(streamify(sourcemaps.init()))
		.pipe(streamify(sourcemaps.write()))
		.pipe(dest(path.build.js))
		.pipe(streamify(uglify()))
		.pipe(rename({ extname: '.min.js' }))
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
}

function fonts() {
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts))
}

function img() {
	return src(path.src.img)
		.pipe(imagemin({
			interlaced: true,
			progressive: true,
			optimizationLevel: 3
		}))
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream())
}

function iconFont() {
	let runTimestamp = Math.round(Date.now() / 1000);
	return src(path.src.icons, { base: sourceFolder })
		.pipe(iconfontCss({
			fontName: fontName,
			path: 'src/scss/template/_icons.scss',
			targetPath: '../../../src/scss/_icons.scss',
			fontPath: '../fonts/icons/'
		}))
		.pipe(iconfont({
			fontName: fontName,
			startUnicode: false,
			prependUnicode: false,
			fontHeight: 1001,
			normalize: true,
			formats: ['ttf', 'eot', 'woff', 'svg', 'woff2'],
			timestamp: runTimestamp,
		}))
		.pipe(dest(path.build.icons))
}

function watchFiles() {
	gulp.watch([path.watch.html], html)
	gulp.watch([path.watch.css], css)
	gulp.watch([path.watch.js], js)
	gulp.watch([path.watch.img], img)
	gulp.watch([path.watch.icons], iconFont)
}

function clean() {
	return del(path.clean)
}

const build = gulp.series(clean, gulp.parallel(js, css, html, img, fonts, iconFont))
const watch = gulp.parallel(build, watchFiles, browserSync)

exports.iconFont = iconFont
exports.fonts = fonts
exports.img = img
exports.js = js
exports.css = css
exports.html = html
exports.clean = clean
exports.build = build
exports.watch = watch
exports.default = watch
