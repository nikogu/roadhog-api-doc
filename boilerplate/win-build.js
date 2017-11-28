var exec = require('child_process').exec;
var path = require('path');
var cwd = process.cwd();

exec(path.join(cwd, './node_modules/.bin/roadhog') + ' build');