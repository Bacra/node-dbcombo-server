var fileRead	= require('./file_reader').buffer;
var vm			= require('vm');
var path		= require('path');
var cache		= require('./cache_memory');
var debug		= require('debug')('dbcombo:dbfile');


exports.DBFile = DBFile;

function DBFile(options)
{
	options || (options = {});
	this.dbCache = options.dbCache || cache.dbCache;
	this.fileCache = options.fileCache || cache.fileCache;
}

// require('util').inherits(DBFile, require('events').EventEmitter);

var proto = DBFile.prototype;

/**
 * @param  {String} root      root path
 * @param  {String} dbUrl     db url
 * @param  {String} indexStr  used file index
 * @return {Promise}          File Array
 */
proto.handle = function(root, dbUrl, indexStr)
{
	var self = this;
	var file = root + '/' + dbUrl;
	debug('start file:%s,%s', file, indexStr);

	return Promise.all([this.loadDB(file), this.parseFileArray(indexStr)])
		.then(function(data)
		{
			return self.filterFiles(data[0], data[1], path.dirname(dbUrl)+'/');
		});
};

proto.parseFileArray = function(data)
{
	return new Promise(function(resolve)
		{
			resolve(parseInt(data, 32));
		});
};

proto.filterFiles = function(filelist, used, relativePath)
{
	var used2 = Number(used);
	if (isNaN(used2)) throw new Error('NO FILE INDEX,'+used);
	if (used2 > Math.pow(2, filelist.length)) throw new Error('INDEX OVERFLOW,'+used2);

	var result = [];
	for(var index = 0; used2; index++, used2 = used2 >>> 1)
	{
		if (used2 & 1)
		{
			result.push(relativePath+filelist[index]);
		}
	}

	console.log('file db:%o used:%o res:%o', filelist, used, result);

	return result;
}


/**
 * loadDB
 * @param  {String} file
 * @return {Promise(JSON)}
 *
 * dbData:
 * ['file1', 'file2', 'file3']
 */
proto.loadDB = function(file)
{
	var self = this;
	var conf = self.dbCache.get(file);
	if (conf) return Promise.resolve(conf);

	return this.loadDBFromFile(file)
			.then(function(data)
			{
				self.dbCache.set(file, data);
				return data;
			});
};

proto.loadDBFromFile = function(file)
{
	var self = this;

	return fileRead(file, self.fileCache)
			.then(function(buf)
			{
				return self.parseDBData_(buf, file);
			});
};

proto.parseDBData_ = function(buf, file)
{
	var extname = path.extname(file).toLowerCase().substr(1);
	var method = this[extname+'2db'] || this.js2db;

	return method.call(this, buf);
};

/**
 * ***2db
 * @param  {Buffer} buf
 * @return {JSON/Promise}
 */
proto.json2db = function(buf)
{
	return JSON.parse(buf.toString());
};

proto.js2db = function(buf)
{
	var module = {exports: {}};
	var context  = {
		module: module,
		exports: module.exports
	};
	vm.runInNewContext(buf.toString(), context);

	return context.module.exports;
};

