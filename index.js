var assign = require('object-assign')
var path = require('path')
var serializerr = require('serializerr')
var getPort = require('getport')
var parseArgs = require('./lib/parse-args')
var defaults = require('lodash.defaults')
var globby = require('globby')

var createHihat = require('./lib/hihat')

module.exports = hihat
module.exports.fromArgs = fromArgs

function fromArgs (args, opt) {
  var cliOpts = parseArgs(args)
  return hihat(assign(cliOpts, opt))
}

function hihat (opts) {
  // require these at runtime
  var app = require('app')
  app.commandLine.appendSwitch('disable-http-cache')
  app.commandLine.appendSwitch('v', 0)
  app.commandLine.appendSwitch('vmodule', 'console=0')
  var BrowserWindow = require('browser-window')
  var globalShortcut = require('global-shortcut')

  opts = assign({}, opts)
  // ensure defaults like devtool / electron-builtins are set
  defaults(opts, parseArgs.defaults)

  var entries = opts.entries || []
  if (typeof entries === 'string') {
    entries = [ entries ]
  }

  if (opts.exec) {
    opts.devtool = false
    opts.quit = true
    opts.print = true
  }

  var basedir = opts.basedir || process.cwd()

  Error.stackTraceLimit = Infinity

  // this will allow the Chrome Console to also
  // find modules within the current working directory
  if (opts.node) {
    var findNodeModules = require('find-node-modules')
    process.env.NODE_PATH = findNodeModules({
      cwd: basedir,
      relative: false
    }).join(path.delimiter)
  }

  var hihat
  var mainWindow = null
  var lastError = null
  app.on('window-all-closed', close)

  process.on('uncaughtException', function (err) {
    process.stderr.write((err.stack ? err.stack : err) + '\n')
    if (opts.quit) {
      close()
    } else {
      lastError = err
      printLastError()
    }
  })

  function close () {
    app.quit()
    if (hihat) {
      hihat.close()
    }
  }

  app.on('ready', function () {
    var basePort = opts.port || 9541
    getPort(basePort, function (err, port) {
      if (err) {
        console.error('Could not get available port')
        process.exit(1)
      }

      var unparsedArgs = opts.browserifyArgs
      globby(entries).then(function (entryFiles) {
        start(assign({}, opts, {
          entries: entryFiles,
          browserifyArgs: entryFiles.concat(unparsedArgs),
          port: port,
          host: opts.host || 'localhost',
          dir: opts.dir || process.cwd()
        }))
      }, function (err) {
        console.error('Error with glob patterns: ' + err.message)
        process.exit(1)
      }).catch(function (err) {
        console.error('Error running hihat: ' + err.message)
        process.exit(1)
      })
    })
  })

  function start (opt) {
    hihat = createHihat(opt)
      .on('connect', function (ev) {
        var bounds = parseBounds(opts.frame)

        // a hidden browser window
        mainWindow = new BrowserWindow(assign({
          'node-integration': opts.node,
          'use-content-size': true
        }, bounds, {
          preload: getPrelude(),
          icon: path.join(__dirname, 'img', 'logo-thumb.png')
        }))

        // reload page shortcuts
        setupShortcuts()

        var webContents = mainWindow.webContents
        webContents.once('did-start-loading', function () {
          if (opts.devtool !== false) {
            mainWindow.openDevTools({ detach: true })
          }
        })

        webContents.once('did-frame-finish-load', function () {
          mainWindow.loadURL(ev.uri)
          mainWindow.once('dom-ready', function () {
            printLastError()
          })

          if (typeof opts.timeout === 'number') {
            setTimeout(function () {
              close()
            }, opts.timeout)
          }
        })

        mainWindow.show()
        // REPL with no browserify entries
        if (entries.length === 0) {
          mainWindow.reload()
        }

        mainWindow.once('closed', function () {
          mainWindow = null
          hihat.close()
        })
      })
      .on('update', function () {
        if (mainWindow) {
          mainWindow.reload()
        }
      })
  }

  function setupShortcuts () {
    app.on('browser-window-focus', function () {
      globalShortcut.register('CmdOrCtrl+R', refresh)
      globalShortcut.register('F5', refresh)
    })

    app.on('browser-window-blur', function () {
      globalShortcut.unregister('CmdOrCtrl+R')
      globalShortcut.unregister('F5')
    })
  }

  function refresh () {
    if (mainWindow) mainWindow.reload()
  }

  function parseBounds (frame) {
    var bounds = { width: 0, height: 0, x: 0, y: 0 }
    if (typeof frame === 'string') {
      var parts = frame.split(',').map(function (x) {
        return parseInt(x, 10)
      })
      if (parts.length === 2) {
        bounds = { width: parts[0], height: parts[1]}
      } else if (parts.length === 4) {
        bounds.x = parts[0]
        bounds.y = parts[1]
        bounds.width = parts[2]
        bounds.height = parts[3]
      } else {
        throw new Error('must specify 2 or 4 values for --frame')
      }
    } else if (frame) {
      bounds = {}
      // allow programmatic frame object
      if (typeof frame.x === 'number') bounds.x = frame.x
      if (typeof frame.y === 'number') bounds.y = frame.y
      if (typeof frame.width === 'number') bounds.width = frame.width
      if (typeof frame.height === 'number') bounds.height = frame.height
    }

    return bounds
  }

  function printLastError () {
    if (!mainWindow || !lastError) return
    var err = serializerr(lastError)
    mainWindow.webContents.executeJavaScript([
      '(function() {',
      // simulate server-side Error object
      'var errObj = ' + JSON.stringify(err),
      'var err = new Error()',
      'mixin(err, errObj)',
      'try {throw err} catch(e) {console.error(e)}',
      'function mixin(a, b) { for (var key in b) a[key] = b[key] }',
      '})()'
    ].join('\n'))
    lastError = null
  }

  function getPrelude () {
    var name
    if (opts.node && opts.print) {
      name = 'node-console.js'
    } else if (opts.node) {
      name = 'node.js'
    } else if (opts.print) {
      name = 'console.js'
    }

    if (name) {
      return path.resolve(__dirname, 'lib', 'prelude', name)
    } else {
      return undefined
    }
  }
}
