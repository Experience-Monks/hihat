/*global HTMLElement*/
var test = require('tape')
var path = window.require('path')

test('test HTML element', function (t) {
  t.equal(3, 3)
  t.equal(3, 3)
  t.ok(document.body instanceof HTMLElement,
      'should be an element')

  t.equal(__dirname, path.join(window.process.cwd(), 'test'), '--no-commondir for bundles')
  t.end()

  setTimeout(function () {
    if (typeof window.close === 'function') {
      window.close()
    }
  }, 500)
})
