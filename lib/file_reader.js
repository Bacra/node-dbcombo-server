'use strict';

var Promise		= require('bluebird');
var fs			= Promise.promisifyAll(require('fs'));
var debug		= require('debug')('dbcombo:file_reader');
var Readable	= require('readable-stream/readable');
var fileCache	= require('./cache_memory').fileCache;


exports.buffer = buffer;
function buffer(file, cache, maxSize)
{
	cache || (cache = fileCache);

	var cont = cache.get(file);
	if (cont)
	{
		debug('readfile from cache:%s', file);
		return Promise.resolve(cont);
	}

	debug('fs readfile:%s', file);
	return fs.readFileAsync(file)
		.then(function(buf)
		{
			if (!maxSize || buf.length < maxSize) cache.set(file, buf);
			return buf;
		})
		.catch(function(err)
		{
			err.fromFile = file;
			throw err;
		});
}

exports.stream = stream;
function stream(file, cache, maxSize)
{
	cache || (cache = fileCache);
	var cont = cache.get(file);
	var st;

	if (cont)
	{
		debug('readfile from cache:%s', file);
		st = new Readable(
		{
			read: function()
			{
				st.push(cont);
				cont = null;
			}
		});
	}
	else
	{
		debug('fs readfile:%s', file);

		var bufarr = [];
		var bufsize = 0;
		st = fs.createReadStream(file);

		st.on('data', function(buf)
			{
				if (!maxSize || bufsize < maxSize)
				{
					bufsize += buf.length;
					bufarr.push(buf);
				}
				else if (bufarr)
				{
					bufarr = null;
				}
			})
			.on('end', function()
			{
				if (bufarr)
				{
					var buf = Buffer.concat(bufarr);
					cache.set(file, buf);
				}

				// setTimeout(function()
				// 	{
				// 		console.log('test stream listener:%d', st.listenerCount());
				// 	}, 1000);
			});
	}

	return st;
}
