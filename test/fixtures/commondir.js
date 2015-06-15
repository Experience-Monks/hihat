var test = require('tape')
var path = require('path')

test('should set no-commondir', function (t) {
  var expected = path.join(process.cwd(), 'test', 'fixtures')
  t.plan(1)
  t.equal(__dirname, expected, 'matches dirname')
})
