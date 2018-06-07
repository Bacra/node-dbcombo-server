'use strict';

var LRU = require('lru-cache');

var dbCache = new LRU(
	{
		max		: 2*1024*1024,
		length	: function(obj) {return JSON.stringify(obj).length}
	});

var fileCache = new LRU(
	{
		max		: 10*1024*1024,
		length	: function(buf) {return buf.length}
	});

var fileStatCache = new LRU(
	{
		max		: 1024
	});

exports.dbCache = dbCache;
exports.fileCache = fileCache;
exports.fileStatCache = fileStatCache;
