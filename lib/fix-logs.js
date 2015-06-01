var through = require('through2')

module.exports = function() {
  return through(function(buf, enc, next) {
    var str = buf.toString()
    var match = /^\[.+console\([0-9]+\)\]\s*\"(.*)\"/i.exec(str)
    if (match) {
      this.push(match[1] + '\n')
    } else {
      // could do additional warning/error logging here...
    }
    next()
  }, function(next) {
    this.push(null)
    next()
  })
}