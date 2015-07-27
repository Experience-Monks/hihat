var minimist = require('minimist')
module.exports = parseArgs
function parseArgs(args) {
  return minimist(args, {
    boolean: ['devtool', 'quit', 'print', 'raw-output'],
    default: { devtool: true },
    alias: {
      'raw-output': 'rawOutput'
    },
    '--': true
  })
}
