// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const {
    src,
    dest,
    watch,
    series,
    parallel
} = require('gulp');
// Importing all the Gulp-related packages we want to use
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
// const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const imagemin = require('gulp-imagemin');

const files = {
    scssPath: './dev/scss/**/main.scss'
}

function minify() {
    return src('./dev/index.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(dest('./'));
};

function scssTask() {
    return src([files.scssPath])
        .pipe(sourcemaps.init()) // initialize sourcemaps first
        .pipe(sass()) // compile SCSS to CSS
        .pipe(postcss([autoprefixer(), cssnano()])) // PostCSS plugins
        .pipe(concat('main.css'))
        .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
        .pipe(dest('./pro/css')); // put final CSS in dist folder
}

//JS task: concatenates and uglifies JS files to script.js
// function jsTask() {
//     return src([
//             files.jsPath, "./node_modules/jquery/dist/jquery.min.js"
//             //,'!' + 'includes/js/jquery.min.js', // to exclude any specific files
//         ])
//         .pipe(concat('main.js'))
//         .pipe(uglify())
//         .pipe(dest('./pro/js'));
// }

function imgTask() {
    //Optimize images
    return src('./dev/images/**')
        .pipe(imagemin())
        .pipe(dest('./pro/images'));

}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask() {
    watch(["./dev/scss/**/*.scss", "./dev/index.html"], {
            interval: 1000,
            usePolling: true
        }, //Makes docker work
        series(
            parallel(scssTask), minify,
            imgTask)
    );
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
    parallel(scssTask),
    minify,
    imgTask,
    watchTask
);