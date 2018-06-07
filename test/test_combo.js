'use strict';

var assert = require('assert');
var LRU = require('lru-cache');
var combo = require('../lib/combo');
var fileArr = new Array(10).join().split(',').map(function(v, i){return i+'.js'});
var root = __dirname+'/file/';

describe('dbcombo', function()
{
	var fileCache = new LRU();
	var fileStatCache = new LRU();
	function comboByListener(done)
	{
		var index = 0;
		new combo.Combo(fileArr, {fileCache: fileCache, fileStatCache: fileStatCache, root: root})
			.on('check', function(stats)
			{
				assert(stats && stats.stats);
			})
			.on('read', function(file, buf)
			{
				assert.equal(index++, buf.toString());
			})
			.handle()
			.then(done, done);
	}
	it('listener', comboByListener);
	it('listener#cache', comboByListener);


	var fileCache2 = new LRU();
	var fileStatCache2 = new LRU();
	function comboByStream(done)
	{
		var bufarr = [];
		combo.createComboStream(fileArr, {fileCache: fileCache2, fileStatCache: fileStatCache2, root: root})
			.on('check', function(stats)
			{
				assert(stats && stats.stats);
			})
			.on('data', function(buf)
			{
				bufarr.push(buf);
			})
			.on('end', function()
			{
				var buf = Buffer.concat(bufarr);
				assert.equal(buf.toString(), '0123456789')
				done();
			})
			.on('error', done);
	}
	it('stream', comboByStream);
	it('stream#cache', comboByStream);


	it('separator', function(done)
	{
		var bufarr = [];
		combo.createComboStream(fileArr, {root: root, separator: ','})
			.on('data', function(buf)
			{
				bufarr.push(buf);
			})
			.on('end', function()
			{
				var buf = Buffer.concat(bufarr);
				assert.equal(buf.toString(), '0,1,2,3,4,5,6,7,8,9,')
				done();
			})
			.on('error', done);
	});
});
