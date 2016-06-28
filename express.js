var Checker		= require('./lib/check_paths').Checker;
var combo		= require('./lib/combo');
var urlCombo	= require('./lib/url_combo_parser');
var DBFile		= require('./lib/dbfile').DBFile;
var debug		= require('debug')('combo:express');


module.exports = handle;

function handle(options)
{
	options || (options = {});
	if (!options.root) options.root = process.cwd()+'/';

	var multiParser	= new urlCombo.MultiFiles(options);
	var dbParser	= new urlCombo.DBFiles(options);
	var checker		= new Checker(options);
	var dbFile		= new DBFile(options);


	function paseMulti(url)
	{
		return new Promise(function(resolve)
			{
				resolve(multiParser.parse(url));
			})
			.catch(function(err)
			{
				debug('MultiFiles parse err:%o', err);
			});
	}

	function paseDB(url)
	{
		return new Promise(function(resolve)
			{
				resolve(dbParser.parse(url));
			})
			.then(function(fileinfo)
			{
				debug('db fileinfo: %o', fileinfo);
				return dbFile.handle(options.root, fileinfo.db, fileinfo.list);
			})
			.catch(function(err)
			{
				debug('db parse err:%o, %s', err, err.stack);
			});
	}


	return function(req, res, next)
	{
		var url = req.url;
		debug('start url:%s', url);
		var startTime = Date.now();

		return Promise.all(
			[
				options.enabledDBParser && paseDB(url),
				options.enabledMultiParser && paseMulti(url)
			])
			.then(function(data)
			{
				var files = data[0] || data[1];
				if (!files) return next();

				return new Promise(function(resolve)
					{
						debug('check files:%o', files);
						checker.check(files);
						resolve();
					})
					.then(function()
					{
						return new Promise(function(resolve, reject)
							{
								var comboStartTime = Date.now();
								var ws = combo.createComboStream(files, options);

								ws.pipe(res);
								ws.on('error', reject)
									.once('check', function(data)
									{
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




