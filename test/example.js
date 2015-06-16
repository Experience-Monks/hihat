var test = require('tape')

test('should do something', function (t) {
  t.plan(1)

  setTimeout(function () {
    t.deepEqual([ 0,; 0 ], [ 0, 0 ], 'are the same')
  }, 50)
})
