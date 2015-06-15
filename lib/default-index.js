var through2 = require('through2')

module.exports = function (opt) {
  var out = through2()
  out.end([
    '<!doctype html>',
    '<head><title>hihat</title><meta charset="utf-8">',
    '</head><body>',
    opt.node
      ? '<script>;(function(){var path=require("path"); module.paths.push(path.join(process.cwd(), "node_modules")); })();</script>'
      : '',
    '<script src="' + opt.entry + '"></script>',
    '</body>',
    '</html>'
  ].join(''))
  return out
}
