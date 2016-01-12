var toBuffer = require('electron-canvas-to-buffer')

var canvas = document.createElement('canvas')
var context = canvas.getContext('2d')
var width = canvas.width
var height = canvas.height

var gradient = context.createLinearGradient(0, 0, width, 0)
gradient.addColorStop(0, '#f39821')
gradient.addColorStop(1, '#f321b0')

context.fillStyle = gradient
context.fillRect(0, 0, width, height)

process.stdout.write(toBuffer(canvas, 'image/png'))
window.close()
