# hihat

![hihat](http://i.imgur.com/Sqpbjzl.gif)

> local Node/Browser development with Chrome DevTools

Runs a source file in a Chrome DevTools process. Saving the file will reload the tab. 

This is useful for locally unit testing browser code with the full range of Web APIs (WebGL, WebAudio, etc). It provides access to profiling, debugger statements, network requests, and so forth. 

It can also be used to develop typical Node projects, or as a generic [Node REPL](#repl). For example, instead of using [nodemon](https://www.npmjs.com/package/nodemon) during development, you can use `hihat` to make use of a debugger.

Since it provides Browser and Node APIs, it can also be used for some simple CLI tooling, like [saving a Canvas2D to a PNG file](#save-canvas-2d-to-png-image).

Under the hood, this uses [electron](https://github.com/atom/electron), [browserify](https://github.com/substack/node-browserify) and [watchify](https://github.com/substack/watchify).

---

#### Update: Jan 2016

A lot of new efforts are going toward [devtool](https://github.com/Jam3/devtool), a very similar project but without `browserify` and `watchify` under the hood. In many ways it replaces `hihat`, but not all. Both tools will continue to exist, although `devtool` will probably receive more regular enhancements and maintenance.

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
hihat [entries] [options] -- [browserifyOptions]
```

Options:

- `--port` (default `9541`)
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
- `--index=path/to/index.html`
  - optional `index.html` file to override the default (see [HTML index](#html-index))
- `--serve`
  - what to serve your bundle entry point as
  - defaults to file name if possible, otherwise 'bundle.js'
- `--browser-field`
  - Can specify `true` or `false` to force enable/disable the `"browser"` field resolution, independently of the `--node` option

By default, browserify will use source maps. You can change this with `--no-debug` as a browserify option:

```sh
hihat test.js -- --no-debug
```

## Node

> **Note:** Users seeking the Node.js features may be more interested in [devtool](https://github.com/Jam3/devtool) – very similar to `hihat` but better architected to deal with large Node applications.

hihat can also be used for developing *simple* Node modules. The `--node` flag will disable the `"browser"` field resolution and use actual Node modules for `process`, `Buffer`, `"os"`, etc. It also exposes `require` statement outside of the bundle, so you can use it in the Chrome Console while developing.

For example, `foobar.js`

```js
var fs = require('fs')

fs.readdir(process.cwd(), function (err, files) {
  if (err) throw err
  debugger
  console.log(files)
})
```

Now we can run the following on our file:

```sh
hihat foobar.js --node
```

![screenshot](http://i.imgur.com/jZdEcxC.png)

By default, enabling `--node` will also enable the Electron builtins. You can pass `--no-electron-builtins` to disable Electron modules and make the source behave more like Node.

#### Limitations

There are some known limitations with this approach.

- Modules that use native addons (like [node-canvas](https://github.com/Automattic/node-canvas)) are not supported.
- Unlike a typical Node.js program, you will need to explicitly quit the application with `window.close()`
- Since the source is run through browserify, the initial build time is slow and features like `require.resolve` are not yet supported. [#21](https://github.com/Jam3/hihat/issues/21)
- Some features like `process.stdin` are not possible. [#12](https://github.com/Jam3/hihat/issues/12)
- Since this runs Electron instead of a plain Node.js runtime, it may produce some unusual results


## REPL

If you specify `hihat` without any entry files, it will not invoke browserify or watchify. For example, you can use this as a generic alternative to the Node REPL, but with better debugging and various Web APIs.

```sh
hihat --node
```

Example:

![repl](http://i.imgur.com/Xns0gGT.png)

## HTML index

By default, hihat will serve a [simple HTML `index.html`](https://www.npmjs.com/package/simple-html-index) file. You can use `--index` for an alternative. The path is relative to your current working directory.

```sh
hihat test.js --index=foo.html
```

And the following `foo.html`:

```html
<!doctype html>
<head>
  <title>FOO</title>
  <meta charset="utf-8">
  </head>
<body>
  <script src="test.js"></script> 
</body>
</html>
```

You can also specify a `--serve` option to force a certain entry point for your bundle. For example:

```sh
hihat test.js --index=foo.html --serve=bundle.js
```

With this, your script tag would be:

```html
<script src="bundle.js"></script> 
```

In most cases, `--serve` will default to the file name of your entry file. In complex cases, such as absolute paths or `'.'`, it may default to `'bundle.js'`.

## Advanced Examples

Some more advanced uses of hihat.

- [prettify TAP in console](prettify-tap-in-console)
- [write clipboard to `stdout`](write-clipboard-to-stdout)
- [save Canvas 2D to PNG image](save-canvas-2d-to-png-image)

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

#### write clipboard to `stdout`

Using the `clipboard` module in Electron, we can write it to stdout like so.

`paste.js`:

```js
var clipboard = require('clipboard')
process.stdout.write(clipboard.readText() + '\n')
window.close()
```

Then run:

```sh
hihat paste.js --node --exec > clipboard.txt
```

This will write the clipboard contents to a new file, `clipboard.txt`.

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

## See Also

- [devtool](https://github.com/Jam3/devtool) - a similar tool, but built specifically for Node and without the browserify/watchify cruft

## License

MIT, see [LICENSE.md](http://github.com/Jam3/hihat/blob/master/LICENSE.md) for details.
