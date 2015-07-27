var args = process.argv.slice(2)
var assign = require('object-assign')
var path = require('path')
var serializerr = require('serializerr')
var argv = require('./lib/parse-args')(args)
var prelude = path.resolve(__dirname, 'lib', 'prelude.js')
var preludeConsole = path.resolve(__dirname, 'lib', 'prelude-console.js')

var app = require('app')
app.commandLine.appendSwitch('disable-http-cache')
app.commandLine.appendSwitch('v', 0)
app.commandLine.appendSwitch('vmodule', 'console=0')

var BrowserWindow = require('browser-window')
var createHihat = require('./lib/hihat')

// Report crashes to atom server.
require('crash-reporter').start()

var hihat
var mainWindow = null, lastError = null
app.on('window-all-closed', close)

process.on('uncaughtException', function (err) {
  process.stderr.write((err.stack ? err.stack : err) + '\n')
  if (argv.quit) {    
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
  var basePort = argv.port || 9541
  require('getport')(basePort, function (err, port) {
    if (err) {
      console.error('Could not get available port')
      process.exit(1)
    }
    
      
    var entries = argv._
    var unparsedArgs = argv['--']
    start({
      entries: entries,
      browserifyArgs: entries.concat(unparsedArgs),
      port: port,
      host: argv.host || 'localhost',
      dir: argv.dir || process.cwd()
    })
  })
})

function start (opt) {
  hihat = createHihat(opt)
    .on('connect', function (ev) {
      var bounds = parseBounds(argv.frame)

      // a hidden browser window
      mainWindow = new BrowserWindow(assign({}, bounds, {
        preload: argv.print ? preludeConsole : prelude,
        icon: path.join(__dirname, 'img', 'logo-thumb.png')
      }))

      var webContents = mainWindow.webContents
      webContents.once('did-start-loading', function () {
        if (String(argv.devtool) !== 'false') {
          mainWindow.openDevTools({ detach: true })
        }
      })

      webContents.once('did-frame-finish-load', function () {
        mainWindow.loadUrl(ev.uri)
        mainWindow.once('dom-ready', function () {
          printLastError()
        })
      })

      mainWindow.show()
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

function parseBounds (frame) {
  var bounds = { width: 0, height: 0, x: 0, y: 0 }
  if (typeof frame === 'string') {
    var parts = frame.split(',').map(function (x) {
      return parseInt(x, 10)
    })
    if (parts.length === 2) {
      bounds = { width: parts[0], height: parts[1] }
    } else if (parts.length === 4) {
      bounds.x = parts[0]
      bounds.y = parts[1]
      bounds.width = parts[2]
      bounds.height = parts[3]
    } else {
      throw new Error('must specify 2 or 4 values for --frame')
    }
  } else if (frame) {
    bounds = {} // let Electron choose default size
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