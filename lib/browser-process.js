var proc = require('process/browser.js')

proc.exit = function (code) {
  window.close()
}

module.exports = proc