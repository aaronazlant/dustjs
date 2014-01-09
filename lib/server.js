var path = require('path'),
    parser = require('./parser'),
    vm = require('vm');

module.exports = function(dust) {
  var compiler = require('./compiler')(dust);
  compiler.parse = parser.parse;
  dust.compile = compiler.compile;

  var context = vm.createContext({dust: dust});
  dust.loadSource = function(source, path) {
    return vm.runInContext(source, context, path);
  };

  dust.nextTick = process.nextTick;

  // expose optimizers in commonjs env too
  dust.optimizers = compiler.optimizers;

  // Publish a Node.js require() handler for .dust files
  if (require.extensions) {
      require.extensions[".dust"] = function(module, filename) {
          var fs = require("fs");
          var text = fs.readFileSync(filename, 'utf8');
          var source = dust.compile(text, filename);
          var tmpl = dust.loadSource(source, filename);

          module.exports = tmpl;
          module.exports.render = function (context, callback) {
            dust.render(filename, context, callback)
          }
          module.exports.stream = function (context) {
            dust.stream(filename, context, callback)
          }
      };
  }
}
