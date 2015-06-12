var test = require('tape')

test('test HTML element', function (t) {
  t.equal(3, 3)
  t.equal(3, 3)
  t.ok(document.body instanceof HTMLElement,
      'should be an element')
  t.end()
  throw new Error("FOO")

  // setTimeout(function () {
  //   if (typeof window.close === 'function')
  //     window.close()
  // }, 500)
})
