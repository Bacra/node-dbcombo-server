DBCombo
==================


[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Appveyor Status][appveyor-image]][appveyor-url]
[![Coveralls][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![NPM License][license-image]][npm-url]


# Install
```
npm install dbcombo --save
```

# Useage

### Server in NodeJS

```
var DBCombo = require('dbcombo');
var expr = require('express');
expr().use(DBCombo({root: __dirname}));
```

### User in Browser

Use by Seajs plugin, See [DBComboClient](https://github.com/Bacra/node-dbcombo-client)


# Options

`root`
`enabledDBParser`
`enabledMultiParser`
`multiParser`
`dbParser`
`checker`
`dbFile`
`maxage`


## MultiFiles Options

`rootSyntax`
`fileSyntax`


## DBFiles Options

`dbreg`


## Checker Options

`limitFiles`
`limitExtname`
`enableMulitExtname`


## Combo Options

`root`
`fileStatCache`
`fileCache`
`separator`
`eachFileLimit`
`maxCacheFileSize`
`preReadFileIndex`


## DBFile Options

`dbCache`
`fileCache`



[npm-image]: http://img.shields.io/npm/v/dbcombo.svg
[downloads-image]: http://img.shields.io/npm/dm/dbcombo.svg
[dependencies-image]: http://img.shields.io/david/Bacra/node-dbcombo.svg
[dependencies-url]: https://www.versioneye.com/nodejs/dbcombo
[npm-url]: https://www.npmjs.org/package/dbcombo
[travis-image]: http://img.shields.io/travis/Bacra/node-dbcombo/master.svg?label=linux
[travis-url]: https://travis-ci.org/Bacra/node-dbcombo
[appveyor-image]: https://img.shields.io/appveyor/ci/Bacra/node-dbcombo/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/Bacra/node-dbcombo
[coveralls-image]: https://img.shields.io/coveralls/Bacra/node-dbcombo.svg
[coveralls-url]: https://coveralls.io/github/Bacra/node-dbcombo
[license-image]: http://img.shields.io/npm/l/dbcombo.svg
