var test = require('tape')
var fs = require('fs')
var browserField = require('./browser-field')

test('should run browser code', function (t) {
  t.plan(3)
  t.equal(browserField(), "from browser")
  t.equal(process.browser, true)
  t.equal(typeof fs.readFile, 'undefined')
})
