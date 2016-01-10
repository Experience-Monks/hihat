var minimist = require('minimist')

module.exports = parseArgs
module.exports.defaults = {
  devtool: true,
  electronBuiltins: true,
  'electron-builtins': true
}

function parseArgs (args) {
  var parsed = minimist(args, {
    boolean: [
      'devtool', 'quit', 'node',
      'print', 'raw-output', 'exec',
      'electron-builtins'
    ],
    default: module.exports.defaults,
    alias: {
      'electron-builtins': 'electronBuiltins',
      'raw-output': 'rawOutput',
      'browser-field': 'browserField'
    },
    '--': true
  })
  parsed.browserifyArgs = parsed['--']
  parsed.entries = parsed._
  return parsed
}
