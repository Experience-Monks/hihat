// optional --print flag
// patches console to stdout/stderr
var format = require('util').format
var sliced = require('sliced')
var isDom = require('is-dom')

var nativeConsole = {}
var methods = ['error', 'info', 'log', 'debug', 'warn']

var _process = require('remote').process

methods.forEach(function (k) {
  var nativeMethod = console[k]
  nativeConsole[k] = nativeMethod.bind(console)

  console[k] = function () {
    var args = sliced(arguments)
    var isError = k === 'error' || k === 'warn'
    var writable = isError ? _process.stderr : _process.stdout
    write(writable, args)
    return nativeMethod.apply(this, args)
  }
})

function write (writable, args) {
  var cleanArgs = args.map(function (arg) {
    return arg && isDom(arg) ? arg.toString() : arg
  })
  var output = format.apply(null, cleanArgs)
  writable.write(output + '\n')
}
