// patch process.argv to something more useful
process.argv = require('remote').process.argv

// in REPL these will be undefined
delete global.__dirname
delete global.__filename