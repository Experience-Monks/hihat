var minimist = require('minimist')
module.exports = parseArgs
function parseArgs(args) {
  return minimist(args, {
    boolean: [
      'devtool', 'quit', 'node', 
      'print', 'raw-output',
      'electorn-builtins'
    ],
    default: {
      devtool: true,
      'electron-builtins': true
    },
    alias: {
      'electron-builtins': 'electronBuiltins',
      'raw-output': 'rawOutput'
    },
    '--': true
  })
}
