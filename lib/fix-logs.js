var through = require('through2')
var split = require('split2')
var duplexer = require('duplexer2')

module.exports = function (opt) {
  opt = opt || {}

  var out = through()
  var parse = split()
    .on('data', function (buf) {
      var str = buf.toString()
      var match = /^\[.+console\([0-9]+\)\]\s*\"(.*)\"/i.exec(str)
      if (match) {
        if (opt.verbose) {
          out.push(match[1] + '\n')
        }
      } else if (!/^\[[0-9]+[\/\:]/.test(str)) {
        out.push(str + '\n')
      }
    })

  return duplexer(parse, out)
}
