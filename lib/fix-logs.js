var through = require('through2')

module.exports = function (opt) {
  opt = opt || {}

  return through(function (buf, enc, next) {
    var str = buf.toString()
    var match = /^\[.+console\([0-9]+\)\]\s*\"(.*)\"/i.exec(str)
    if (match) {
      if (opt.verbose) {
        this.push(match[1] + '\n')
      }
    } else if (!/^\[[0-9]+\:/.test(str)) {
      this.push(str)
    }
    next()
  }, function (next) {
    this.push(null)
    next()
  })
}
