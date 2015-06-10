# hihat <sub>![logo](img/logo-thumb.png)</sub>

![hihat](http://i.imgur.com/Sqpbjzl.gif)

> like `nodemon` with Chrome DevTools 

Runs the given source files in a new Chromium DevTools window. Saving the file will reload the tab. 

This is useful for locally unit testing browser code with the full range of Web APIs (WebGL, WebAudio, etc). It also provides access to profiling, debugger statements, network requests, and so forth.

Under the hood, this uses [electron](https://github.com/atom/electron), [browserify](https://github.com/substack/node-browserify) and [watchify](https://github.com/substack/watchify).

Currently only tested on OSX Yosemite.

**Note: This is still experimental and subject to change.**

## Install

[![NPM](https://nodei.co/npm/hihat.png)](https://www.npmjs.com/package/hihat)

Use `npm` to install it globally.

```sh
npm install hihat -g
```

## Usage

Simplest case is just to run `hihat` on any source file that can be browserified (Node/CommonJS).

```sh
hihat index.js
```

Since it runs browserify under the hood, you can pass any options to it:

```sh
# transpile ES6 files
hihat tests/*.js --transform babelify --debug
```

You can use the browserify plugin [tap-dev-tool](https://github.com/Jam3/tap-dev-tool) to pretty-print TAP output in the console.

```sh
# install it locally
npm install tap-dev-tool --save-dev

# now run it as a plugin
hihat test.js -p tap-dev-tool
```

Files that use [tap](https://www.npmjs.com/package/tap) or [tape](https://www.npmjs.com/package/tape) will be logged like so:

![tap-dev-tool](http://i.imgur.com/LS014oR.png)

## Ideas / Future

Since this builds on Electron, it could open up some interesting possibilities down the road:

- saving files natively from JS
- resizing the browser from JS tests
- taking screen shots during development
- communicating with Node-specific APIs
- operating on clipboard
- piping TAP contents to terminal console

## License

MIT, see [LICENSE.md](http://github.com/Jam3/hihat/blob/master/LICENSE.md) for details.
