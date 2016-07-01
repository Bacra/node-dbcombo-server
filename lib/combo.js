var fs			= require('fs');
var path		= require('path');
var fileRead	= require('./file_reader').stream;
var async		= require('async');
var cache		= require('./cache_memory');
var debug		= require('debug')('dbcombo:combo');
var Readable	= require('readable-stream/readable');


exports.Combo = Combo;
// separator must buffer
function Combo(files, options)
{
	options || (options = {});

	this.root				= options.root || process.cwd()+'/',
	this.fileStatCache		= options.fileStatCache || cache.fileStatCache;
	this.fileCache			= options.fileCache || cache.fileCache;
	this.separator			= options.separator || null;
	this.eachFileLimit		= options.eachFileLimit || 5;
	this.maxCacheFileSize	= options.maxCacheFileSize || 200*1024;
	this.preReadFileIndex	= options.preReadFileIndex;

	this.files = files;
}

require('util').inherits(Combo, require('events').EventEmitter);

var proto = Combo.prototype;

proto.handle = function()
{
	var self = this;

	var root = self.root;
	self.files = self.files.map(function(file)
		{
			return path.normalize(root+'/'+file);
		});

	return self.checkFiles()
		.then(function()
		{
			return self.read();
		})
		.then(function()
		{
			self.close();
		});
}

proto.checkFiles = function()
{
	var self = this;
	var fileStatCache = self.fileStatCache;

	return new Promise(function(resolve, reject)
		{
			var stats = new FileStats;

			// maybe file handle overflow
			async.eachLimit(self.files, self.eachFileLimit, function(file, callback)
			{
				var stat = fileStatCache.get(file);
				if (stat)
				{
					debug('get stat form cache:%s', file);
					stats.push(stat);
					callback();
				}
				else
				{
					fs.stat(file, function(err, stat)
					{
						if (err) return callback(err, file);
						if (!stat || !stat.isFile || !stat.isFile())
						{
							return callback(new Error('NOT FILE'), file);
						}

						stats.push(stat);
						fileStatCache.set(file, stat);
						callback();
					});
				}
			},
			function(err, file)
			{
				if (err)
				{
					debug('stat err:%o file:%s', err, file);
					err.fromFile = file;
					reject(err);
				}
				else
				{
					debug('emit check, len:%d', stats.stats.length);
					self.emit('check', stats);
					resolve(stats);
				}
			});
		});
};

proto.read = function()
{
	return this._readfileOneByOne(0);
};

proto._readfileOneByOne = function(index)
{
	var self = this;
	var file = self.files[index];
	if (file)
	{
		// 预读逻辑
		var preFile = self.preReadFileIndex && self.files[self.preReadFileIndex+index];
		if (preFile) fileRead(preFile, self.fileCache, self.maxCacheFileSize);

		return self._readfile(file)
			.then(function()
			{
				return self._readfileOneByOne(++index);
			});
	}
};

proto._readfile = function(file)
{
	var self = this;

	return new Promise(function(resolve, reject)
		{
			fileRead(file, self.fileCache, self.maxCacheFileSize)
				.on('data', function(buf)
				{
					self.emit('read', file, buf);
				})
				.once('error', reject)
				.once('end', function()
				{
					if (self.separator)
						self.emit('read', null, self.separator);
					resolve();
				});
		});
};

proto.close = function()
{
	this.removeAllListeners();
};


exports.createComboStream = createComboStream;
function createComboStream(files, options)
{
	var combo = new exports.Combo(files, options);
	var st = new Readable(
		{
			read: function(){}
		});

	st.comboInstance = combo;

	combo.on('check', function(data)
		{
			st.emit('check', data);
		})
		.on('read', function(file, buf)
		{
			st.push(buf);
		})
		.handle()

		// finish
		.then(function()
		{
			st.push(null);
		},
		function(err)
		{
			st.emit('error', err);
		});

	return st;
}


function FileStats()
{
	this.stats = [];
}

var proto = FileStats.prototype;
proto.push = function(stat)
{
	this.stats.push(stat);
};

proto.lastMtime = function()
{
	var last;

	this.stats.forEach(function(stat)
	{
		if (!last)
			last = stat;
		else if (stat.mtime > last.mtime)
			last = stat;
	});

	return last;
};
