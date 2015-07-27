// patch process.argv,stderr,stdout
require('./prelude')

// patch console log for TAP output
var format = require('util').format
var sliced = require('sliced')
var isDom = require('is-dom')

var nativeConsole = {}
var methods = ['error', 'info', 'log', 'debug', 'warn']

methods.forEach(function (k) {
  var nativeMethod = console[k]
  nativeConsole[k] = nativeMethod.bind(console)
  
  console[k] = function () {
    var args = sliced(arguments)
    var isError = k === 'error' || k === 'warn'
    var writable = isError ? process.stderr : process.stdout
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