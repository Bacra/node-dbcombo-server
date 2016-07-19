DBCombo  [![Build Status](https://travis-ci.org/Bacra/node-dbcombo.svg?branch=master)](https://travis-ci.org/Bacra/node-dbcombo)
==================

# Install
```
npm install dbcombo --save
```

# Useage

Server in NodeJS
```
var DBCombo = require('dbcombo');
var expr = require('express');
expr().use(DBCombo({root: __dirname}));
```

Browser for Seajs
```
<script src="node_modules/dbcombo/dist/seajs-dbcombo.js"></script>
```

Seajs Config
```
seajs.config(
{
	DBComboFileIndex: {},		// uri => index
	DBComboFile: 'http://www.example.com/db.js',		// dbfile uri
	DBComboExcludes: function(uri){return false}		// RegExp / Function
});
```

combo uri exapmle

```
http://www.example.com/db.js/Yg0W21X/W35X/W35X/W35X/W35X.js
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
