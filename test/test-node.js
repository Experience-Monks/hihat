var spawn = require('../bin/spawn')
var series = require('async-each-series')
var path = require('path')

// still gotta figure out a clean way of unit
// testing this project

function start (args, done) {
  return spawn(args).on('end', done)
}

function fixture (name) {
  return path.join(__dirname, 'fixtures', name)
}

function test (file) {
  var args = Array.prototype.slice.call(arguments, 1)
  return [fixture(file), '--timeout=1000', '--print', '--quit'].concat(args)
}

series([
  test('test-node-with-electron.js', '--node')
], start)
