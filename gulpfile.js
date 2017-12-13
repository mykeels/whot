const gulp = require('gulp')
const browserify = require('browserify')
const uglify = require('gulp-uglify-es').default
const source = require('vinyl-source-stream')
const streamify = require('gulp-streamify')
const rename = require('gulp-rename')

const buildScripts = () => {
    const getSourceScript = () => browserify('./src/index.js', { standalone: 'Game' }).bundle().pipe(source('index.js'))

    const transformScript = (source) => source.pipe(rename('index.min.js')).pipe(streamify(uglify()))

    const setDestination = (source) => source.pipe(gulp.dest('./dist/'))

    setDestination(transformScript(getSourceScript()))

    setDestination(getSourceScript())
}

gulp.task('build', buildScripts)

gulp.task('watch', () => {
    gulp.watch('./src/*.js', buildScripts)
})
