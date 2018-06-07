'use strict';
// require('debug').enable('*');

var assert		= require('assert');
var DBFile		= require('../lib/dbfile').DBFile;
var ClientKey	= require('dbcombo-client');
var toLinuxPath	= require('../lib/utils').toLinuxPath;

describe('dbfile', function()
{
	it('overflow#1ZZY1Y1', function()
	{
		var db = new DBFile();
		return db.handle(__dirname, '/data/db.js', '1ZZY1Y1')
			.then(function()
			{
				assert(false);
			},
			assert);
	});

	it('errfilelist', function()
	{
		var db = new DBFile();
		return db.handle(__dirname, '/data/db.js', '&^%')
			.then(function()
			{
				assert(0);
			},
			assert);
	});

	assertClientKey([0]);
	assertClientKey([0, 31]);
	assertClientKey([0, 31, 92, 93, 94]);
});


function assertClientKey(use)
{
	it('clearkey#'+use.join(), function()
	{
		var db = new DBFile();
		return db.handle(__dirname, '/data/db.js', ClientKey.stringify(use))
			.then(function(files)
			{
				files.forEach(function(file, index)
				{
					assert.equal(toLinuxPath(file), '/data/'+use[index]);
				});
			});
	});
}
