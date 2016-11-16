'use strict';

var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var PLUGIN_NAME = 'gulp-style-modules';
var prependFile = require('prepend-file');
var fs = require('fs');

module.exports = function(opts) {
    function namefn(file) {
        // path/to/filename.css -> filename-styles
        return path.basename(file.path, path.extname(file.path)) + '-styles';
    }

    var fname = opts && opts.filename || namefn;
    var modid = opts && opts.moduleId || namefn;
    var iFile = opts && opts.includeFile;
    var bPath = opts && opts.basePath;
    var cwd = opts && opts.cwd;

    return through.obj(function (file, enc, cb) {

        if (file.isStream()) {
            return cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }
        if (file.isNull()) {
            return cb(null, file);
        }

        var filename = typeof fname === 'function' ? fname(file) : fname;
        var moduleId = typeof modid === 'function' ? modid(file) : modid;
        var includeFile = typeof iFile === 'function' ? iFile(file) : iFile;
        var basePath = typeof bPath === 'function' ? bPath(file) : bPath;
        var sourceDir = typeof cwd === 'function' ? cwd(file) : cwd;

        var dirname = path.dirname(file.path);
        //prepare base path by concating base path with include file path, then removing filename, then turning
        //forward slashes to backslashes
        var concatPath = basePath + '/' + includeFile.replace(/[^\/]*$/, '');
        concatPath = concatPath.replace(/\//g, '\\');
        //setting relative path to style-module
        var relativeFilePath = dirname.substring(dirname.lastIndexOf(concatPath)).replace(/\\/g, '/')
        //map path from includeFile to stylemodule
        var relativePathToStyleModule = path.relative(concatPath, relativeFilePath) + '/' + filename + '.html'

        var importStyleModule = '<link rel="import" href="' + relativePathToStyleModule + '">';

        var res = '<dom-module id="' + moduleId + '">\n' +
          '<template>\n' +
          '<style>\n' +
          file.contents.toString('utf8') + '\n' +
          '</style>\n' +
          '</template>\n' +
          '</dom-module>';

        file.contents = new Buffer(res);
        file.path = path.join(dirname, filename) + '.html';

        //make sure includeFile argument actually points to an existing file
        fs.exists(path.join(sourceDir, basePath, includeFile), function(exists) {
            if (exists) {
                //skip if include already exists
                var rstream = fs.createReadStream(path.join(sourceDir, basePath, includeFile));
                var found = false;
                rstream.on('data',function(d){
                    if(!found) found=(''+d).indexOf(importStyleModule) > 0 ? true : false
                });
                rstream.on('error',function(err){
                    console.error("error occured", err)
                });
                rstream.on('close',function(err){
                    if(!found) {
                        //put include into original component
                        var wstream = fs.createWriteStream(path.join(sourceDir, basePath, includeFile), {'flags': 'a'});
                        wstream.once('open', function(fd) {
                            wstream.write("\n"+importStyleModule);
                            wstream.end();
                        });
                    }
                });
            } else {
                console.log('Provided Path "' + path.join(basePath, includeFile) + '"does not exist.')
            }
        });



        return cb(null, file);
    });

};

