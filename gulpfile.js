var gulp = require("gulp");
var del = require("del");
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

gulp.task("default", function (callback) {
    runSequence("clean", "build", "tslint", callback);
});