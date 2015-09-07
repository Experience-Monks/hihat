#!/usr/bin/env node
var args = process.argv.slice(2)
var path = require('path')
var parseArgs = require('../lib/parse-args')
var spawn = require('../spawn')
var globby = require('globby')

var argv = parseArgs(args)
var server = path.resolve(__dirname, 'server.js')
var patterns = argv.entries

globby(patterns).then(function (entries) {
  var rest = args.slice(patterns.length)
  args = entries.concat(rest)

  spawn(server, args, {
    rawOutput: argv.rawOutput
  })
})
