'use strict';

var path	= require('path');
var extend	= require('extend');

exports.defaults =
{
	limitFiles			: 80,
	limitExtname		: ['js', 'css'],
	enableMulitExtname	: false
};

exports.options = options;
function options(opts)
{
	opts = extend({}, exports.defaults, opts);
	var extnames = opts.extnames = {}
	opts.limitExtname.forEach(function(name)
	{
		extnames[name.toLowerCase()] = true;
	});

	return opts;
}

exports.Checker = Checker;
function Checker(options)
{
	options || (options = {});
	this.options = options.options === false ? options : exports.options(options);
}

var proto = Checker.prototype;

proto.check = function(files)
{
	var self		= this;
	var options		= self.options;
	var disMulit	= !options.enableMulitExtname;
	var extnames	= options.extnames;

	if (options.limitFiles && files.length > options.limitFiles)
		throw new Error('FILES NUM OVERFLOW');

	var mainExtname = null;

	files.forEach(function(file)
	{
		var extname = path.extname(file).substr(1).toLowerCase();
		if (!extnames[extname]) throw new Error('INVALID EXTNAME,'+file);

		if (mainExtname == null)
			mainExtname = extname;
		else if (disMulit && mainExtname != extname)
			throw new Error('MULIT EXTNAME,'+mainExtname+','+extname+','+file);
	});
};
