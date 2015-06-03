# hihat

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

## This is stil a work in progress.

Runs the given source files in a new Chromium DevTools window. Saving the file will reload the tab. Under the hood, this electron to run DevTools, and browserify/watchify for fast incremental bundling.

This is useful for locally unit testing browser code with the full range of Web APIs (WebGL, WebAudio, etc).

Currently only tested on OSX Yosemite.

## Install

[![NPM](https://nodei.co/npm/hihat.png)](https://www.npmjs.com/package/hihat)

Use `npm` to install it globally.

```sh
npm install hihat -g
```

## Usage

The arguments are passed to watchify (and thus browserify). Examples:

```sh
# open DevTools and run the file
hihat index.js

# run all ES6 files in the tests/ folder
hihat tests/*.js -d -t babelify
```

## License

MIT, see [LICENSE.md](http://github.com/Jam3/hihat/blob/master/LICENSE.md) for details.
