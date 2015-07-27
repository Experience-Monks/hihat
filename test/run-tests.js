// W.I.P.
// still gotta figure out a clean way of
// automating all tests into one

var spawn = require('../bin/spawn')
var series = require('async-each-series')
var path = require('path')

function start (args, done) {
  return spawn(args).on('close', done)
}

function fixture (name) {
  return path.join(__dirname, 'fixtures', name)
}

function test (file) {
  var args = Array.prototype.slice.call(arguments, 1)
  return [fixture(file), '--timeout=1000', '--print', '--quit'].concat(args)
}

series([
  test('test-node-with-electron.js', '--node'),
  test('test-browser'),
  test('test-index.js', '--index=test/fixtures/index.html', '--serve=bundle.js')
], start, function () {
  console.log("Finished")
})