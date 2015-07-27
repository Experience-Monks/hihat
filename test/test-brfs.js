var test = require('tape')
var fs = require('fs')
var url = require('url')
console.log(url.parse)
console.log(process.argv)
// process.stderr.write("HELLO WORLD\n")

test('should do something', function (t) {
  t.plan(1)
  t.ok(true, 'got ya')
  // fs.readFile(__dirname + '/../README.md', 'utf8', function (err, data) {
  //   t.equal(typeof data, 'string')
  // })
})
