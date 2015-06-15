var args = process.argv.slice(2)
var assign = require('object-assign')
var path = require('path')
var argv = require('minimist')(args, {
  boolean: ['devtool'],
  default: { devtool: true }
})

var app = require('app')
app.commandLine.appendSwitch('disable-http-cache')
app.commandLine.appendSwitch('v', 0)
app.commandLine.appendSwitch('vmodule', 'console=0')

var BrowserWindow = require('browser-window')
var createHihat = require('./lib/hihat')

// Report crashes to atom server.
require('crash-reporter').start()

var hihat
var mainWindow = null
app.on('window-all-closed', close)

process.on('uncaughtException', function (err) {
  process.stderr.write((err.stack ? err.stack : err) + '\n')
  close()
})

function close () {
  app.quit()
  if (hihat) {
    hihat.close()
  }
}

app.on('ready', function () {
  var basePort = argv.port || 9966
  require('getport')(basePort, function (err, port) {
    if (err) {
      console.error('Could not get available port')
      process.exit(1)
    }

    start({
      port: port,
      host: argv.host || 'localhost',
      dir: argv.dir || process.cwd()
    })
  })
})

function start (opt) {
  hihat = createHihat(args, opt)
    .on('connect', function (ev) {
      var frame = argv.frame
        ? { width: 640, height: 320 }
        : { width: 0, height: 0, x: 0, y: 0 }

      // a hidden browser window
      mainWindow = new BrowserWindow(assign({}, frame, {
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
