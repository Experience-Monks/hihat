var createServer = require('./watchify-server')
var createBundler = require('./watchify-bundler')
var Emitter = require('events/')
var once = require('once')
var normalizeUrl = require('normalize-file-to-url-path')

module.exports = function (opt) {
  opt = opt || {}
  if (!opt.host || !opt.port) {
    throw new Error('must specify port and host')
  }
  var host = opt.host
  var port = opt.port

  var emitter = new Emitter()

  // get the name of the script without query-string
  var entries = opt.entries
  var entry = opt.serve
  if (!entry && entries.length > 0) {
    // what to serve, defaults to file path or 'bundle.js'
    // in tricky situations (like '.')
    entry = normalizeUrl(entries[0]) || 'bundle.js'
  }

  var server = createServer({
    serve: entry,
    entries: entries,
    dir: opt.dir,
    index: opt.index
  })
    .on('error', function (err) {
      emitter.emit('error', err)
    })
    .listen(port, host, function () {
      var hostname = (host || 'localhost')
      var uri = 'http://' + hostname + ':' + port + '/'
      emitter.emit('connect', {
        uri: uri
      })
    })

  // create a new watchify instance
  var bundler
  if (entries.length > 0) {
    bundler = createBundler(opt.browserifyArgs, opt)
      .on('update', function (contents) {
        server.update(contents)
        emitter.emit('update', entry, contents)
      })
      .on('pending', function () {
        server.pending()
        emitter.emit('pending', entry)
      })
      .on('error', function (err) {
        emitter.emit('error', err)
      })
  }

  emitter.close = once(function () {
    server.close()
    if (bundler) {
      bundler.close()
    }
  })

  return emitter
}
