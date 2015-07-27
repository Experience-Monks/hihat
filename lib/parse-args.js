var minimist = require('minimist')
module.exports = parseArgs
function parseArgs(args) {
  var parsed = minimist(args, {
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
  
  if (parsed.exec) {
    parsed.devtool = false
    parsed.quit = true
    parsed.print = true
  }
  
  return parsed
}
