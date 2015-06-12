#!/usr/bin/env node
var proc = require('child_process')
var electron = require('electron-prebuilt')
var path = require('path')
var logger = require('../lib/fix-logs')
var fs = require('fs')

var args = process.argv.slice(2)
var argv = require('minimist')(args)

var serverPath = path.join(__dirname, '../server.js')

var file = process.argv[2]
if (!file) {
  console.error('No file path specified')
  process.exit(1)
}

if (!fs.existsSync(path.resolve(file))) {
  console.error('Cannot access ', file + ': No such file')
  process.exit(1)
}

// spawn electron
var p = proc.spawn(electron, [serverPath].concat(args))
p.stderr.pipe(logger({
  verbose: argv.verbose
})).pipe(process.stdout)
