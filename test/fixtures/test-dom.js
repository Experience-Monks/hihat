var test = require('tape')
var path = require('path')

test('existence of HTML/DOM in browser bundle', function (t) {
  t.ok(document.body instanceof window.HTMLElement,
      'should be an element')
  t.equal(path.basename(__dirname), 'fixtures', 'gets folder name')
  t.end()
})
