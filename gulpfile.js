const gulp = require('gulp')
const browserify = require('browserify')
const uglify = require('gulp-uglify-es').default
const source = require('vinyl-source-stream')
const streamify = require('gulp-streamify')
const rename = require('gulp-rename')

const buildScripts = () => {
    browserify('./src/index.js', {
        standalone: 'Game'
    })
        .bundle()
        .pipe(source('index.js'))
        .pipe(rename('index.min.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest('./dist/'))
}

gulp.task('build', buildScripts)

gulp.task('watch', () => {
    gulp.watch('./src/*.js', buildScripts)
})
