// require('debug').enable('*');

var assert = require('assert');
var DBFile = require('../lib/dbfile').DBFile;
var ClientKey = require('../src/dbfile_client');

describe('dbfile', function()
{
	doAssert('1', [0]);
	doAssert('11', [0, 1]);
	doAssert('101', [0, 2]);
	doAssert('00101', [0, 2]);
	doAssert('1000000011', [0, 1, 9]);
	// doAssert('10000000111', [0, 8, 9]);
	doAssert('00000001111', [0, 1, 2, 3]);
	doAssert2('1Y1Y1', [0, 31, 62]);
	doAssert2('1ZY1Y1', [0, 31, 93]);


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

	it('clientkey', function()
	{
		assert.equal(ClientKey.key([0]), 'Y1');
		assert.equal(ClientKey.key([0, 30]), '1000001');
		assert.equal(ClientKey.key([0, 31]), 'Y1Y1');
	});
	doAssert3([0]);
	doAssert3([0, 31]);
	doAssert3([0, 31, 92, 93, 94]);
});


function doAssert(use, list)
{
	it('use#'+use, function()
	{
		var db = new DBFile();
		return db.handle(__dirname, '/data/db.js', parseInt(use, 2).toString(32))
			.then(function(files)
			{
				files.forEach(function(file, index)
				{
					assert.equal(file, '/data/'+list[index]);
				});
			});
	});
}

function doAssert2(use, list)
{
	it('use#'+use, function()
	{
		var db = new DBFile();
		return db.handle(__dirname, '/data/db.js', use)
			.then(function(files)
			{
				files.forEach(function(file, index)
				{
					assert.equal(file, '/data/'+list[index]);
				});
			});
	});
}

function doAssert3(use)
{
	it('clearkey#'+use.join(), function()
	{
		var db = new DBFile();
		return db.handle(__dirname, '/data/db.js', ClientKey.key(use))
			.then(function(files)
			{
				files.forEach(function(file, index)
				{
					assert.equal(file, '/data/'+use[index]);
				});
			});
	});
}
