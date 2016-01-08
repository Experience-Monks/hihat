var proc = require('child_process')
var electron = require('electron-prebuilt')
var logger = require('./lib/fix-logs')

module.exports = spawnElectron
function spawnElectron (server, args, opt) {
  args = args || []
  opt = opt || {}

  // spawn electron
  var p = proc.spawn(electron, [ server ].concat(args))
  p.stdout.pipe(process.stdout)

  if (opt.rawOutput) {
    p.stderr.pipe(process.stderr)
  } else {
    // pipe chromium-stripped logs
    p.stderr.pipe(logger()).pipe(process.stderr)
  }

  return p
}
