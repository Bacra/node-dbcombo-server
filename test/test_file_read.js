'use strict';

var assert = require('assert');
var FileReader = require('../lib/file_reader');
var LRU = require('lru-cache');

describe('fileReader', function()
{
	var cache = new LRU();
	function readByBuffer(done)
	{
		FileReader.buffer(__dirname+'/file/1.js', cache)
			.then(function(buf)
			{
				assert.equal(buf.toString(), 1);
				done();
			});
	}

	it('buffer', readByBuffer);
	it('buffer#cache', readByBuffer);

	var cache2 = new LRU();
	function readByStream(done)
	{
		FileReader.stream(__dirname+'/file/2.js', cache2)
			.on('data', function(data)
			{
				assert.equal(data.toString(), 2);
				done();
			});
	}

	it('stream', readByStream);
	it('stream#cache', readByStream);
});
