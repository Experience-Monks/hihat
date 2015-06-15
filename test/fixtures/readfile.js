var fs = require('fs')
var path = require('path')
var test = require('tape')

test('should read a file', function (t) {
  var buf = fs.readFileSync(path.join(__dirname, 'file.txt'))
  t.ok(buf instanceof Buffer, 'is buffer')
  t.equal(Buffer.isBuffer(buf), true, 'is buffer')

  var str = buf.toString('utf-8')
  t.equal(str, 'foobar', 'matches')
  t.end()
})
