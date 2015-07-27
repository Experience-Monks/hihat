var createWatchify = require('watchify')
var fromArgs = require('browserify/bin/args')
var Emitter = require('events/')
var debounce = require('debounce')
var concat = require('concat-stream')
var parseError = require('./parse-error')
var minimist = require('minimist')

// a bit unsafe here :\ PRs welcome
var browserifyBuiltins = require('browserify/lib/builtins')

module.exports = function (browserifyArgs, opt) {
  var emitter = new Emitter()
  var delay = opt.delay || 0
  var closed = false
  var pending = true
  
  // allow user to disable debug-by-default
  var useDebug = opt.debug !== false
  var userOpts = minimist(browserifyArgs, {
    boolean: 'debug',
    alias: { debug: 'd' }
  })
  if (String(userOpts.debug) === 'false') {
    useDebug = false
  }

  var browserify = fromArgs(browserifyArgs, {
    cache: {},
    packageCache: {},
    commondir: false, // needed for __dirname and __filename
    debug: useDebug,
    builtins: browserifyBuiltins
  })
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
    wb.once('error', function (err) {
      console.error('%s', err)
      err = parseError(err)
      contents = ';console.error(' + JSON.stringify(err) + ');'
      didError = true
      bundleEnd()
    })
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
