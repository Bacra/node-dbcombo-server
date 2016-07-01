var fileRead		= require('./file_reader').buffer;
var vm				= require('vm');
var path			= require('path');
var cache			= require('./cache_memory');
var debug			= require('debug')('dbcombo:dbfile');
var dbFileClient	= require('../src/dbfile_client');

// 使用32位内，否则无法进行位计算
// 使用31位，去掉符号位，方便进行 | 合并
var EACH_GROUP_FILE_NUM = dbFileClient.EACH_GROUP_FILE_NUM;
var MAX_GROUP_KEY_LENGTH = dbFileClient.MAX_GROUP_KEY_LENGTH;
var MATH_LOGE2 = Math.log(2);

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
			return self.filterFiles(data[0], data[1], path.dirname(dbUrl)+'/', indexStr);
		});
};

proto.parseFileArray = function(data)
{
	return new Promise(function(resolve)
		{
			var arr = data.split('');
			var groups = [];
			var index = 0;
			var groupval = '';
			for(var i = arr.length, val; i--;)
			{
				val = arr[i];
				// Z是跳过的31位，Y是不足7位时候的补位
				if (val == 'Z' || val == 'Y')
				{
					if (groupval) groups[index] = parseInt(groupval, 32);
					index++;
					groupval = '';
				}
				else
				{
					groupval = val + groupval;
					// 31位数字parse之后，长度最长为7
					if (groupval.length >= MAX_GROUP_KEY_LENGTH)
					{
						if (groupval) groups[index] = parseInt(groupval, 32);
						index++;
						groupval = '';
					}
				}
			}

			if (groupval) groups[index] = parseInt(groupval, 32);

			resolve(groups);
		});
};

proto.filterFiles = function(filelist, groups, relativePath, indexStr)
{
	var lastIndex = groups.length -1;
	var lastItem = groups[lastIndex];
	var requestMaxIndex = lastIndex*EACH_GROUP_FILE_NUM+Math.log(lastItem)/MATH_LOGE2;
	debug('[%s]global len:%d group:%o, max index:%d, file lenth:%d', indexStr, lastIndex+1, groups, requestMaxIndex, filelist.length);

	if (!lastItem) throw new Error('NO FILE INDEX,'+indexStr);
	if (requestMaxIndex > filelist.length) throw new Error('INDEX OVERFLOW,'+indexStr);

	var result = [];
	groups.forEach(function(used, groupIndex)
	{
		var offsetIndex = groupIndex*EACH_GROUP_FILE_NUM;
		for(var index = 0; used; index++, used = used >>> 1)
		{
			if (used & 1)
			{
				result.push(relativePath+filelist[offsetIndex+index]);
			}
		}
	});

	debug('[%s] result len:%d list:%o', indexStr, result.length, result);

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

