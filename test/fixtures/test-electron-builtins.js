var clipboard = require('clipboard')
process.stdout.write(clipboard.readText() + '\n')

window.close()

// var clipboard = require('clipboard')

// var image = clipboard.readImage()
// var buffer = image.toPng()
// process.stdout.write(buffer)

// // close window
// window.close()
