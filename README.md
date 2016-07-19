DBCombo  [![Build Status](https://travis-ci.org/Bacra/node-dbcombo.svg?branch=master)](https://travis-ci.org/Bacra/node-dbcombo)
==================

# Install
```
npm install dbcombo --save
```

# Useage

Linker config file:
```
var DBCombo = require('dbcombo');
var expr = require('express');
expr().use(DBCombo({root: __dirname}));
```

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
