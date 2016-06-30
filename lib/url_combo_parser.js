var path	= require('path');
var extend	= require('extend');
var debug	= require('debug')('dbcombo:url_combo_parser');

exports.MultiFiles = MultiFiles;
function MultiFiles(options)
{
	this.options = extend({}, this.defaults, options);
}

var proto = MultiFiles.prototype;
proto.defaults =
{
	rootSyntax: '??',
	fileSyntax: ','
};


proto.parse = function(url)
{
	var options = this.options;
	// 快速序列化
	// url = path.normalize(url);
	// if (url.charAt(0) == '.') throw new Error('PATH OVERFLOW,'+url);

	var indexRoot = url.indexOf(options.rootSyntax);
	if (indexRoot == -1 || url.length == indexRoot+1) throw new Error('NO COMBO SYNTAX');

	var rootSplit = path.normalize(url.substr(0, indexRoot));
	debug('root path:%s', rootSplit);

	if (isOverflowPath(rootSplit)) throw new Error('ROOT PATH OVERFLOW');

	var urls = url.substr(indexRoot+options.rootSyntax.length).split(options.fileSyntax);

	var files = [];
	urls.forEach(function(url)
	{
		if (!url) debug('empty url');
		var file = path.normalize(rootSplit+ '/' + url);

		debug('push file:%s', file);
		files.push(file);
	});

	return files;
};


exports.DBFiles = DBFiles;
function DBFiles(options)
{
	this.options = extend({}, this.defaults, options);
}

var proto = DBFiles.prototype;
proto.defaults = {
	dbreg: /(.+\.js)[\/\\]([\w\$\-]+)(?:\.(\w{1,5}))/
};

proto.parse = function(url)
{
	// 快速序列化
	var file = path.normalize(url);
	if (isOverflowPath(file)) throw new Error('PATH OVERFLOW,'+url);
	debug('parse url:%s=>%s', url, file);

	var params = file.match(this.options.dbreg);
	if (!params) throw new Error('NO COMBO SYNTAX');

	return {
		db		: params[1],
		list	: params[2],
		type	: params[3]
	};
}



function isOverflowPath(p)
{
	return p.substr(0,2) == '..';
}

