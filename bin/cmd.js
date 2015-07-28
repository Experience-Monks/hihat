#!/usr/bin/env node
var args = process.argv.slice(2)
var path = require('path')
var parseArgs = require('../lib/parse-args')
var spawn = require('../spawn')

var argv = parseArgs(args)
var server = path.resolve(__dirname, 'server.js')

spawn(server, args, {
  rawOutput: argv.rawOutput
})
