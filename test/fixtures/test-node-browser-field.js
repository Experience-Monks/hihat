var test = require('tape')
var fs = require('fs')
var browserField = require('./browser-field')

test('should run node / electron code with browser modules', function (t) {
  t.plan(3)
  t.equal(browserField(), 'from browser', 'uses browser-field for dependencies')
  t.equal(process.browser, undefined, 'gets Electron process')
  t.equal(typeof fs.readFile, 'function', 'gets Electron fs')
})
