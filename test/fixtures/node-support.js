var test = require('tape')
var os = require('os')
var http = require('http')
var child_process = require('child_process')
var concat = require('concat-stream')
var request = require('request')

test('should run child_process', function (t) {
  t.plan(1)

  var proc = child_process.exec('echo "blah"')
  proc.stdout.pipe(concat(function (body) {
    t.equal(body, 'blah\n')
  }))
})

test('should report OS stuff', function (t) {
  t.equal(typeof os.hostname(), 'string', 'gets hostname')
  t.end()
})

test('should create a server', function (t) {
  t.plan(3)
  var server = http.createServer(function (req, res) {
    res.statusCode = 202
    res.end('blahblah')
  })
    .on('error', function (err) {
      t.fail(err)
    })

  server.listen(8000, 'localhost', function () {
    t.ok(true, 'connected')

    request.get('http://localhost:8000/', function (err, resp, body) {
      if (err) return t.fail(err)
      t.equal(resp.statusCode, 202, 'gets status code')
      t.equal(body, 'blahblah', 'gets server response')
      server.close()
    })
  })
})
