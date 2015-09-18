var proc = require('remote').process
require('console-redirect')(proc.stdout, proc.stderr)
