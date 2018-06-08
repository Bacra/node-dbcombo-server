'use strict';

var Promise		= require('bluebird');
var etag		= require('etag');
var mime		= require('mime');
var Checker		= require('./lib/check_paths').Checker;
var combo		= require('./lib/combo');
var urlCombo	= require('./lib/url_combo_parser');
var DBFile		= require('./lib/dbfile').DBFile;
var debug		= require('debug')('dbcombo:express');


module.exports = handle;

function handle(options)
{
	options || (options = {});
	if (!options.root) options.root = process.cwd()+'/';

	var multiParser	= options.multiParser || new urlCombo.MultiFiles(options);
	var dbParser	= options.dbParser || new urlCombo.DBFiles(options);
	var checker		= options.checker || new Checker(options);
	var dbFile		= options.dbFile || new DBFile(options);

	options.maxage = Math.floor(Math.max(0, Number(options.maxage) || 3600*365));


	function paseMulti(url)
	{
		return Promise.resolve()
			.then(function()
			{
				return multiParser.parse(url);
			})
			.catch(function(err)
			{
				err.error = true;
				return err;
			});
	}

	function paseDB(url)
	{
		return Promise.resolve()
			.then(function()
			{
				return dbParser.parse(url);
			})
			.then(function(fileinfo)
			{
				debug('db fileinfo: %o', fileinfo);
				return dbFile.handle(options.root, fileinfo.db, fileinfo.list);
			})
			.catch(function(err)
			{
				err.error = true;
				return err;
			});
	}


	return function(req, res, next)
	{
		if (req.method && req.method != 'GET') return next();

		var url = req.url;
		debug('start url:%s', url);
		var startTime = Date.now();

		// 使用路径进行debug参数设置，防止cdn回源的时候，被缓存
		var isOnlyDisplayList = false;
		if (url.substr(-11) == '$debug_list')
		{
			isOnlyDisplayList = true;
			url = url.substr(0, url.length-11);
		}

		return Promise.all(
			[
				options.enabledDBParser && paseDB(url),
				options.enabledMultiParser && paseMulti(url)
			])
			.then(function(data)
			{
				var dbfiles = data[0];
				var multifiles = data[1];
				var files;
				if ((!dbfiles || dbfiles.error) && (!multifiles || multifiles.error))
				{
					debug('db parse:%o, multifiles parse:%o', dbfiles, multifiles);
					return next();
				}

				if (!dbfiles || dbfiles.error)
				{
					files = multifiles;
					req.__combo_type__ = 'multifiles';
				}
				else
				{
					files = dbfiles;
					req.__combo_type__ = 'dbfiles';
				}

				if (!files && !files.length) return next();

				return Promise.resolve()
					.then(function()
					{
						debug('check files:%o', files);
						checker.check(files);
						req.__combo_files__ = files;
					})
					.then(function()
					{
						if (isOnlyDisplayList)
						{
							res.json(files);
							return;
						}

						return new Promise(function(resolve, reject)
							{
								var comboStartTime = Date.now();
								var ws = combo.createComboStream(files, options);

								debug('combo start:%s', url);
								ws.pipe(res);
								ws.once('error', reject)
									.once('check', function(stats)
									{
										setResHeader(req, res, stats, options);
										debug('combo check:%dms', Date.now() - comboStartTime);
									})
									.once('end', function()
									{
										debug('combo send:%dms', Date.now() - comboStartTime);
										resolve();
									});
							});
					})
					.then(function()
					{
						debug('combo end:%dms', Date.now() - startTime);
					});
			})
			.catch(function(err)
			{
				debug('combo err:%o', err);
				next(err)
			});
	}
}




function setResHeader(req, res, stats, options)
{
	if (res._header)
	{
		debug('headers already sent');
	}
	else
	{
		// if (!res.getHeader('Content-Length'))
		// {
		// 	var contentLength = stats.size(options.separator || options.separator.length);
		// 	debug('content len:%d', contentLength);
		// 	res.setHeader('Content-Length', contentLength);
		// }

		if (!res.getHeader('Content-Type'))
		{
			var type = mime.lookup(req.url);
			var charset = mime.charsets.lookup(type);
			debug('content-type %s', type);
			res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
		}

		if (!res.getHeader('Cache-Control'))
		{
			res.setHeader('Cache-Control', 'public, max-age=' + options.maxage);
		}


		var lastStat = stats.lastMtime();
		debug('lastStat mtime:%s', lastStat.mime);

		if (!res.getHeader('Last-Modified'))
		{
			res.setHeader('Last-Modified', lastStat.mtime.toUTCString());
		}

		if (!res.getHeader('ETag'))
		{
			res.setHeader('ETag', etag(lastStat));
		}
	}
}
