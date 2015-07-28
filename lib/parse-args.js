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
      'print', 'raw-output',
      'electron-builtins'
    ],
    default: module.exports.defaults,
    alias: {
      'electron-builtins': 'electronBuiltins',
      'raw-output': 'rawOutput'
    },
    '--': true
  })
  parsed.browserifyArgs = parsed['--']
  parsed.entries = parsed._
  return parsed
}
