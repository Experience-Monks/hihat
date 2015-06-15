var createServer = require('./watchify-server')
var createBundler = require('./watchify-bundler')
var Emitter = require('events/')
var url = require('url')
var once = require('once')
var path = require('path')

module.exports = function (args, opt) {
  opt = opt || {}
  if (!opt.host || !opt.port) {
    throw new Error('must specify port and host')
  }
  var host = opt.host
  var port = opt.port

  var emitter = new Emitter()

  // get the name of the script without query-string
  var file = path.basename(args[0])
  var entry = url.parse(file).path

  var server = createServer({ serve: entry, dir: opt.dir })
    .on('error', function (err) {
      emitter.emit('error', err)
    })
    .listen(port, host, function (err) {
      if (err) {
        emitter.emit('error', new Error('Could not connect to server: ' + err))
        return
      }

      var hostname = (host || 'localhost')
      var uri = 'http://' + hostname + ':' + port + '/'
      emitter.emit('connect', {
        uri: uri
      })
    })

  // create a new watchify instance
  var bundler = createBundler(args, opt)
    .on('update', function (contents) {
      server.update(contents)
      emitter.emit('update', entry, contents)
    })
    .on('pending', function () {
      server.pending()
      emitter.emit('pending', entry)
    })
    .on('error', emitter.emit.bind(emitter, 'error'))

  emitter.close = once(function () {
    server.close()
    bundler.close()
  })

  return emitter
}
