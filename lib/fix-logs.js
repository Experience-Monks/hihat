var through = require('through2')
var split = require('split2')
var duplexer = require('duplexer2')

module.exports = function (opt) {
  opt = opt || {}

  var isMultiline = false
  var consoleStart = /^\[.+INFO:CONSOLE\([0-9]+\)\]\s*\"(.*)(\"|$)/
  var consoleEnd = /\"\, source\: https?\:\/\//
  var chromiumLogs = /^\[[0-9]+[\/\:]/

  var out = through()
  var parse = split()
    .on('data', function (buf) {
      var str = buf.toString()
      if (consoleStart.test(str)) {
        // line doesnt have an end in it
        if (!consoleEnd.test(str)) {
          isMultiline = true
        }
      } else if (isMultiline && consoleEnd.test(str)) {
        isMultiline = false
      } else if (!isMultiline && !chromiumLogs.test(str)) {
        out.push(str + '\n')
      }
    })

  return duplexer(parse, out)
}
