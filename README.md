# gulp-style-modules

A gulp plugin for wrapping css files into style modules as used by [Polymer](http://polymer-project.org)

## Install

```sh
$ npm install --save-dev gulp-style-modules
```

## Examples

```js
var stylemod = require('gulp-style-modules');

// Wrap css files
gulp.task("modularize-styles", function() {
    gulp.src("./src/**/*.css")
        .pipe(stylemod({
            // All files will be named 'styles.html'
            filename: "styles",
            // Use '-css' suffix instead of '-styles' for module ids
            moduleId: function(file) {
                return path.basename(file.path, path.extname(file.path)) + "-css";
            }
        }))
        .pipe(gulp.dest("./src"));
}

// Use with preprocessor (e.g. stylus)
gulp.task("modularize-styles", function() {
    gulp.src("./src/**/*.styl")
        .pipe(stylus({use: [nib()]}))
        .pipe(stylemod())
        .pipe(gulp.dest("./src"));
}
```

## Options / Defaults

```js
{
    // string / function to be used for file names. Can be either a fixed string or a function
    // that takes a [vinyl](https://github.com/gulpjs/vinyl) file object and returns a string
    filename: function(file) {
        return path.basename(file.path, path.extname(file.path)) + "-styles";
    },
    // string / function to be used for module ids. Can be either a fixed string or a function
    // that takes a [vinyl](https://github.com/gulpjs/vinyl) file object and returns a string
    moduleId: function(file) {
        return path.basename(file.path, path.extname(file.path)) + "-styles";
    }
}
```

## LICENSE [MIT](LICENSE)
