var hulk = {},
    hogan = require('hogan'),
    fs = require('fs'),
    path = require("path"),
    views = __dirname + '/../public/hogan';

hulk.compile = function(source, options) {
    views = (options.settings.views) ? options.settings.views : views;

    if (typeof source == 'string') {
        return function(options) {
            var rgx = new RegExp("{{([>-])\\s?([^\#\\^]+?)\\1?}}+", "g"),
                lines = source.split('\n');
            
            if (!options.locals) options.locals = {};
            if (options.body) options.locals.contents = options.body;
            
            if (!options.partials) options.partials = {};
            
            for (var pname in options.partials) {
                options.partials[pname] = hogan.compile(options.partials[pname]);  
            }
            
            for(var nbr = 0; nbr < lines.length; nbr++) {
                var part = rgx.exec(lines[nbr]);

                if (part !== null) {
                    if (part[1] == '>' && !options.partials[part[2]]) {
                        var filePath = views + '/' + part[2] + (options.extension || '.hogan');
                        
                        if (path.existsSync(filePath)) {
                            var partialContent = fs.readFileSync(filePath, 'utf-8');
                            options.partials[part[2]] = hogan.compile(partialContent);
                        }
                    }
                }
            }
            
            var html = hogan.compile(source);
            return html.render(options.locals, options.partials);
        };
    } else {
        return source;
    } 
};


// Dependencies
var async = require('async');

// Utility functions
hulk.precompile = function(callback) {
  var results = "Templates={};";

  fs.readdir(views, function(err, files) {
    if(err) return callback(err);

    var compileFile = function(file, done) { 
    
        fs.lstat(views + '/' + file, function(error, stats) {
                
            if(stats.isDirectory()) { done(); return }
            else {
              fs.readFile(views + '/' + file, function(err, contents) {
                if(err) return done(err);
        
                var compiled = hogan.compile(contents.toString(), {asString : true});
                var name = file.split('.')[0];
                
                results = results + "\nTemplates['" + name + "']=" + compiled;
                done();
              });            
            }
        })
    };

    async.forEach(files, compileFile, function(err) {
      if(err) return callback(err);
      callback(null, results);
    });
  });
};

// Exports
hulk.templates = function(req, res, next) {
  hulk.precompile(function(err, compiledTemplates) {
    if(err) return next(err);

    res.contentType('text/javascript');
    res.send(compiledTemplates);
  });
};

module.exports = hulk;
