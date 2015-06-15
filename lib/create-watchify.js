var watchify = require('watchify')
var fromArgs = require('browserify/bin/args')

module.exports = function createWatchify (args, opt) {
  var node = opt.node

  var browserify = fromArgs(args, {
    cache: {},
    packageCache: {},
    commondir: false,
    builtins: node ? {
      _process: require.resolve('./process.js')
    } : undefined
  })

  var builtins = node ? [
    'ipc', 'remote', 'web-frame', 'clipboard', 'crash-reporter',
    'native-image', 'screen', 'shell'
  ] : []

  builtins.forEach(function (x) {
    browserify.exclude(x)
  })

  var watcher = watchify(browserify, {
    delay: 0
  })
  return watcher
}
