var test = require('tape')
var fs = require('fs')
var nativeImage = require('native-image')
var browserField = require('./browser-field')

test('should run node / electron code', function (t) {
  t.plan(4)
  t.equal(browserField(), "from node")
  t.equal(process.browser, undefined)
  t.equal(typeof fs.readFile, 'function')
  t.ok(nativeImage, true, 'got electron builtin')
})
