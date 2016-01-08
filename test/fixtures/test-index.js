// hihat test/fixtures/test-index.js --serve=bundle.js --index=test/fixtures/index.html
var test = require('tape')

test('should run index.html and serve bundle.js', function (t) {
  t.plan(1)
  t.equal(window.someGlobal, 'foobar', 'gets global')
})
