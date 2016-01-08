var test = require('tape')
var exec = require('child_process').exec
var path = require('path')

var cli = path.resolve(__dirname, '..', 'bin', 'cmd.js')

test('should use exit code 0', function (t) {
  t.plan(1)
  var child = exec([ cli, './fixtures/test-exit.js' ].join(' '), { cwd: __dirname })
  child.on('exit', function (code) {
    t.equal(code, 0, 'matches 0')
  })
})
