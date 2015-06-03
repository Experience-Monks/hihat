var test = require('tape')

test('should do something', function (t) {
  t.equal(3, 3)
  t.equal(1, 2)
  t.ok(document.body instanceof HTMLElement)
  t.end()
})
