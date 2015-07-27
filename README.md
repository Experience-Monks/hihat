# hihat <sub>![logo](img/logo-thumb.png)</sub>

![hihat](http://i.imgur.com/Sqpbjzl.gif)

> interactive Node/Browser testing with Chrome DevTools

Runs a source file in a Chrome DevTools process. Saving the file will reload the tab. 

This is useful for locally unit testing browser code with the full range of Web APIs (WebGL, WebAudio, etc). It provides access to profiling, debugger statements, network requests, and so forth. 

It can also be used to develop typical Node projects. For example, instead of using [nodemon](https://www.npmjs.com/package/nodemon) during development, you can use `hihat` to make use of a debugger.

Eventually; this may be useful for headless testing of Node/Browser code on a server.

Under the hood, this uses [electron](https://github.com/atom/electron), [browserify](https://github.com/substack/node-browserify) and [watchify](https://github.com/substack/watchify).

Currently only tested on OSX Yosemite.

**This project is still in active development.**

## Install

[![NPM](https://nodei.co/npm/hihat.png)](https://www.npmjs.com/package/hihat)

This project is currently best suited as a global install. Use `npm` to install it like so:

```sh
npm install hihat -g
```

## Basic Examples

Simplest case is just to run `hihat` on any source file that can be browserified (Node/CommonJS).

```sh
hihat index.js
```

Any options after `--` will be passed to browserify. For example:

```sh
# transpile ES6 files
hihat tests/*.js -- --transform babelify
```

You can use `--print` to redirect `console` logging into your terminal:

```sh
hihat test.js --print | tap-spec
```

The process will stay open until you call `window.close()` from the client code. Also see the `--quit` and `--timeout` options in [Usage](#usage).

## Usage

Usage:

```sh
hihat entries [options] -- [browserifyOptions]
```

Options:

- `--pot` (default `9541`)
  - the port to host the local server on
- `--host` (default `'localhost'`)
  - the host for the local development server
- `--dir` (default `process.cwd()`)
  - the root directory to serve static files from
- `--print`
  - `console.log` and `console.error` will print to `process.stdout` and `process.stderr`
- `--quit`
  - uncaught errors (like syntax) will cause the application to exit (useful for unit testing)
- `--frame` (default `'0,0,0,0'`)
  - a comma-separated string for `x,y,width,height` window bounds
  - if only two numbers are passed, treated as `width,height`
  - if `true` is passed, uses the native default size
- `--no-devtool`
  - do not open a DevTools window when running
- `--raw-output`
  - do not silence Chromium debug logs on stdout/stderr
- `--node`
  - enables Node integration (see [node](#node))
- `--no-electron-builtins`
  - when `--node` is enabled, makes it behave more like Node by ignoring Electron builtins
- `--timeout` (default 0)
  - a number, will close the process after this duration. Use 0 for no timeout
- `--exec`
  - an alias for `--print`, `--no-devtool` and `--quit` options. Useful for headless executions

By default, browserify will use source maps. You can change this with `--no-debug` as a browserify option:

```sh
hihat test.js -- --no-debug
```

## Node

hihat can also be used for developing Node code. This will disable the `"browser"` field resolution and use actual Node modules for `process`, `Buffer`, `"os"`, etc. It also exposes `require` statement outside of the bundle, so you can use it in the Chrome Console.

By default, enabling `--node` will also enable the Electron builtins. For example, say we have `paste.js`:

```js
var clipboard = require('clipboard')
process.stdout.write(clipboard.readText()+'\n')
window.close()
```

Now we can run the following on our file:

```sh
hihat paste.js --node --exec > clipboard.txt
```

This will write the clipboard contents to a new file, `clipboard.txt`.

You can pass `--no-electron-builtins` to disable Electron modules and make the source behave more like Node.

**Note:** Modules that use native addons (like [node-canvas](https://github.com/Automattic/node-canvas)) are not supported.

## Advanced Examples

#### prettify TAP in console

You can use the browserify plugin [tap-dev-tool](https://github.com/Jam3/tap-dev-tool) to pretty-print TAP output in the console.

```sh
# install it locally
npm install tap-dev-tool --save-dev

# now run it as a plugin
hihat test.js -- -p tap-dev-tool
```

Files that use [tap](https://www.npmjs.com/package/tap) or [tape](https://www.npmjs.com/package/tape) will be logged like so:

![tap-dev-tool](http://i.imgur.com/LS014oR.png)

#### save Canvas 2D to PNG image

Here is an example which writes a Canvas2D element into a new PNG image, using [electron-canvas-to-buffer](https://github.com/mattdesl/electron-canvas-to-buffer).

`render.js`

```js
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
```

Now run the following:

```sh
hihat render.js --node --exec > image.png
```

And the result of `image.png` will be:

![image](http://i.imgur.com/whDkS67.png)

## License

MIT, see [LICENSE.md](http://github.com/Jam3/hihat/blob/master/LICENSE.md) for details.
