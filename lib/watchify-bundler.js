var createWatchify = require('watchify')
var fromArgs = require('browserify/bin/args')
var Emitter = require('events/')
var debounce = require('debounce')
var concat = require('concat-stream')
var parseError = require('./parse-error')
var minimist = require('minimist')

var electronBuiltins = [
  'ipc', 'remote', 'web-frame', 'clipboard', 'crash-reporter',
  'native-image', 'screen', 'shell', 'electron'
]

module.exports = watchifyBundler
function watchifyBundler (browserifyArgs, opt) {
  browserifyArgs = browserifyArgs.slice()

  var emitter = new Emitter()
  var delay = opt.delay || 0
  var closed = false
  var pending = true

  // allow user to disable debug-by-default
  var useDebug = opt.debug !== false
  var userOpts = minimist(browserifyArgs, {
    boolean: 'debug',
    default: { debug: true },
    alias: { debug: 'd' }
  })
  if (userOpts.debug === false) {
    useDebug = false
  }

  var bOpts = {
    cache: {},
    packageCache: {},
    commondir: false, // needed for __dirname and __filename
    basedir: opt.basedir,
    browserField: opt.browserField,
    debug: useDebug
  }

  var browserField = String(opt.browserField) === 'true'
  // only change in non-node mode if user specifies something
  if (typeof opt.browserField !== 'undefined') {
    bOpts.browserField = browserField
  }

  // ensure browserify does not mess with our Node code
  if (opt.node) {
    // only use browser field if user wants it
    bOpts.browserField = browserField
    bOpts.builtins = false
    // browserify tries to use require('_process') by default
    // in Electron we can just insert the global process name instead
    bOpts.insertGlobalVars = {
      process: function () { return 'window.process' }
    }
  }

  var browserify = fromArgs(browserifyArgs, bOpts)

  // allow Electron builtins to work by default
  // when node integration is enabled
  if (opt.node && opt.electronBuiltins) {
    electronBuiltins.forEach(function (x) {
      browserify.exclude(x)
    })
  }

  var watchify = createWatchify(browserify, {
    // we use our own debounce, so make sure watchify
    // ignores theirs
    delay: 0
  })
  var contents = null

  emitter.close = function () {
    if (closed) {
      return
    }
    closed = true
    if (watchify) {
      // needed for watchify@3.0.0
      // this needs to be revisited upstream
      setTimeout(function () {
        watchify.close()
      }, 50)
    }
  }

  var bundleDebounced = debounce(bundle, delay)
  watchify.on('update', function () {
    emitter.emit('pending')
    pending = true
    bundleDebounced()
  })

  // initial bundle
  emitter.emit('pending')
  pending = true
  bundle()

  function bundle () {
    if (closed) {
      update()
      return
    }

    var didError = false

    var outStream = concat(function (body) {
      if (!didError) {
        contents = body
        bundleEnd()
      }
    })

    var wb = watchify.bundle()
    // whether we should quit on errors
    if (!opt.quit) {
      wb.once('error', function (err) {
        if (!opt.print) { // avoid duplication
          console.error('%s', err)
        }
        err = parseError(err)
        contents = ';console.error(' + JSON.stringify(err) + ');'
        didError = true
        bundleEnd()
      })
    }
    wb.pipe(outStream)

    function bundleEnd () {
      update()
    }
  }
  return emitter

  function update () {
    if (pending) {
      pending = false
      emitter.emit('update', contents)
    }
  }
}
