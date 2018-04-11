var glob = require('glob');
var mocha = require('gulp-mocha');
var gulp = require("gulp");
var del = require("del");
var gutil = require('gulp-util');
var tslint = require("gulp-tslint");
var libtslint = require("tslint");
var runSequence = require("run-sequence");
var sourcemaps = require("gulp-sourcemaps");
var ts = require("gulp-typescript");

var srcPath = "src";
var testPath = "test";

var sources = [
    srcPath,
    testPath,
].map(function (tsFolder) { return tsFolder + "/**/*.ts"; });

var lintSources = [
    srcPath,
    testPath
].map(function (tsFolder) { return tsFolder + "/**/*.ts"; });
lintSources = lintSources.concat([
    "!src/appcenter/lib/**"
]);

gulp.task("tslint", function () {
    var program = libtslint.Linter.createProgram("./tsconfig.json");
    return gulp.src(lintSources, { base: "." })
        .pipe(tslint({
            formatter: "verbose",
            program: program
        }))
        .pipe(tslint.report());
});

gulp.task("clean", function () {
    var pathsToDelete = [
        "src/**/*.js",
        "!src/appcenter/lib/**/*.js",
        "src/**/*.js.map",
        "test/**/*.js",
        "test/**/*.js.map",
        "out/",
        ".vscode-test/"
    ]
    return del(pathsToDelete, { force: true });
});

gulp.task("build", function () {
    var tsProject = ts.createProject("tsconfig.json");
    // var isProd = false; // TODO: determine
    // var preprocessorContext = isProd ? { PROD: true } : { DEBUG: true };
    return tsProject.src()
        // .pipe(preprocess({ context: preprocessorContext })) //To set environment variables in-line
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .on("error", function (e) {
            callback(e);
        })
        .pipe(sourcemaps.write(".", {
            includeContent: false,
            sourceRoot: "."
        }))
        .pipe(gulp.dest(function (file) {
            return file.cwd;
        }));
});

gulp.task("run-tests", function (callback) {
    var tsProject = ts.createProject("tsconfig.json");
    tsProject.config.files = glob.sync('./test/**/*.ts');

    var globalMochaSettings = {
        clearRequireCache: true,
        ignoreLeaks: false,
        timeout: 5000,
        slow: 200,
        reporter: 'spec'
    };

    var testFiles = tsProject.config.files.slice();
    for (var i = 0; i < testFiles.length; i++) {
        testFiles[i] = testFiles[i].replace(/.ts$/i, '.js');
    }

    gulp.src(testFiles)
        .pipe(mocha(globalMochaSettings))
        .once('error', function (err) {
            if (callback) {
                cb(err);
                callback = null;
            }
        })
        .once('end', function () {
            if (callback) {
                cb();
                callback = null;
            }
        });
});

gulp.task("debug", function (callback) {
    runSequence("clean", "build", callback);
});

gulp.task("test", function (callback) {
    runSequence("build", "run-tests", callback);
});

gulp.task("default", function (callback) {
    runSequence("clean", "build", "tslint", "test", callback);
});