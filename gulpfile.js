var gulp = require("gulp");
var plugins = require("gulp-load-plugins")();
var del = require('del');
var runSequence = require('run-sequence');

var cfg = {
    sourceFolder: "app/",
    sourceAssets: "assets/",
    targetFolder: "build/",
    targetAssets: "build/static/",
    scriptFolder: "scripts/",
    vendorFolder: "vendor/",
    templateFolder: "templates/",
    styleFolder: "styles/"
};

gulp.task("default", ["build-fe"]);
gulp.task("build:dev", function (callback) {
    runSequence("clean", ["build-be", "build-fe:dev"], callback)
});
gulp.task("build", function (callback) {
    runSequence("clean", ["build-be", "build-fe"], callback)
});
gulp.task("build-fe", function (callback) {
    runSequence("clean-static", ["vendor", "scripts", "style", "templates"], "index", callback)
});
gulp.task("build-fe:dev", function (callback) {
    runSequence("clean-static", ["vendor", "scripts:dev", "style:dev", "templates"], "index", callback)
});

gulp.task("build-be", function () {
    return gulp.src([cfg.sourceFolder + "**/*.js", "package.json"])
        .pipe(gulp.dest(cfg.targetFolder));
});


gulp.task("scripts", function () {
    return gulp.src([cfg.sourceAssets + "**/*.module.js", cfg.sourceAssets + "**/*.js"])
        .pipe(plugins.concat("app.js"))
        .pipe(gulp.dest(cfg.targetAssets + cfg.scriptFolder))
        .pipe(plugins.gzip())
        .pipe(gulp.dest(cfg.targetAssets + cfg.scriptFolder));
});

gulp.task("scripts:dev", function (cb) {
    return gulp.src([cfg.sourceAssets + "**/*.module.js", cfg.sourceAssets + "**/*.js"])
        .pipe(plugins.flatten())
        .pipe(gulp.dest(cfg.targetAssets + cfg.scriptFolder));
});

gulp.task("vendor", function () {
    //copy vendor scripts
    return gulp.src(cfg.vendorFolder + "**/*.js")
        .pipe(gulp.dest(cfg.targetAssets + cfg.vendorFolder))
        .pipe(plugins.gzip())
        .pipe(gulp.dest(cfg.targetAssets + cfg.vendorFolder));
});

gulp.task("style", function () {
    return gulp.src(cfg.sourceAssets + "**/*.less")
        .pipe(plugins.less())
        .pipe(plugins.concat("style.css"))
        .pipe(gulp.dest(cfg.targetAssets + cfg.styleFolder))
        .pipe(plugins.gzip())
        .pipe(gulp.dest(cfg.targetAssets + cfg.styleFolder));
});

gulp.task("style:dev", function () {
    return gulp.src(cfg.sourceAssets + "**/*.less")
        .pipe(plugins.less())
        .pipe(plugins.flatten())
        .pipe(gulp.dest(cfg.targetAssets + cfg.styleFolder))
});

gulp.task("templates", function () {
    return gulp.src(cfg.sourceAssets + "components/**/*.html")
        .pipe(plugins.flatten())
        .pipe(gulp.dest(cfg.targetAssets + cfg.templateFolder))
        .pipe(plugins.gzip())
        .pipe(gulp.dest(cfg.targetAssets + cfg.templateFolder));
});

gulp.task("index", function () {
    var headScripts = gulp.src([
        cfg.targetAssets + cfg.vendorFolder + "**/*.js",
        cfg.targetAssets + cfg.scriptFolder + "**/*.module.js",
        cfg.targetAssets + cfg.scriptFolder + "**/*.js",
    ], { read: false });

    var headStyles = gulp.src([
        cfg.targetAssets + cfg.styleFolder + "**/*.css",
    ], { read: false });

    return gulp.src(cfg.sourceAssets + "index.html")
        .pipe(plugins.inject(headScripts, {
            name: 'head', ignorePath: cfg.targetAssets, addRootSlash: false, transform: function (filepath) {
                return '<script defer src="' + filepath + '"></script>';
            }
        }))
        .pipe(plugins.inject(headStyles, {
            name: 'head', ignorePath: cfg.targetAssets, addRootSlash: false
        }))
        .pipe(gulp.dest(cfg.targetAssets))
        .pipe(plugins.gzip())
        .pipe(gulp.dest(cfg.targetAssets))
});

gulp.task("clean", function () {
    return del([cfg.targetFolder + "**/*"]);
});

gulp.task("clean-static", function () {
    return del([cfg.targetAssets + "**/*"]);
});