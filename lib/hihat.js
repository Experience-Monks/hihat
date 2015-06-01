var createServer = require('./watchify-server')
var createBundler = require('./watchify-bundler')
var Emitter = require('events/')
var url = require('url')

module.exports = function (args, opt) {
  opt = opt || {}
  var host = opt.host || 'localhost'
  var port = opt.port || 9966

  var emitter = new Emitter()

  var entry = url.parse(args[0]).path
  var server = createServer({ serve: entry })
    .on('error', function(err) {
      emitter.emit('error', err)
    })
    .listen(port, host, function(err) {
      if (err) {
        emitter.emit('error', new Error("Could not connect to server: " + err))
        return
      }

      var hostname = (host || 'localhost')
      var uri = "http://" + hostname + ":" + port + "/"
      emitter.emit('connect', {
        uri: uri
      })
    })

  //create a new watchify instance
  var bundler = createBundler(args)
    .on('update', function(contents) {
      server.update(contents)
      emitter.emit('update', entry, contents)
    })
    .on('pending', function() {
      server.pending()
      emitter.emit('pending', entry)
    })
    .on('error', emitter.emit.bind(emitter, 'error'))

  emitter.close = function() {
    server.close()
    bundler.close()
  }

  return emitter
}