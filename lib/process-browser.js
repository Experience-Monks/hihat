var _process = require('process/browser')
module.exports = _process

var remoteProcess = window[Symbol.for('hihat-remote-process')]
if (!remoteProcess) {
  console.error("hihat: %s", "Cannot find remote process!")
} else {
  _process.argv = remoteProcess.argv
  _process.stderr = remoteProcess.stderr
  _process.stdout = remoteProcess.stdout
}

window.process = _process