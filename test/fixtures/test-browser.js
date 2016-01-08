// hihat test/fixtures/test-browser.js
var test = require('tape')
var fs = require('fs')
var browserField = require('./browser-field')
var path = require('path')

test('should run browser code', function (t) {
  t.plan(5)
  t.equal(browserField(), 'from browser')
  t.equal(process.browser, true)
  t.equal(typeof fs.readFile, 'undefined')
  t.ok(document.body instanceof window.HTMLElement,
    'should be an element')
  t.equal(path.basename(__dirname), 'fixtures', 'gets folder name')
})
