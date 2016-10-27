// require('debug').enable('*');

var assert		= require('assert');
var DBFile		= require('../lib/dbfile').DBFile;
var ClientKey	= require('dbcombo-client');
var toLinuxPath	= require('../lib/utils').toLinuxPath;

describe('dbfile', function()
{
	assertParse1('1', [1]);
	assertParse1('Y1', [1]);
	assertParse1('YY1', [1]);
	assertParse1('Z1', [1]);
	assertParse1('ZZ1', [1]);
	assertParse1('ZZZZZZZ1', [1]);
	assertParse1('1Z1', [1,1]);
	assertParse1('1ZZ1', [1, , 1]);
	assertParse1('1Y1', [1,1]);
	assertParse1('1YY1', [1, , 1]);
	assertParse1('1W4X1', [1, , , , 1]);
	assertParse1('1W4XY1', [1, , , , , 1]);
	assertParse1('W4X1', [1]);

	assertParse2('4X1', '4X');
	assertParse2('4X', '4X');
	assertParse2('WX1', 'WX');
	assertParse2('1WX1', 'WX');
	assertParse2('WCX1', 'WCX');
	assertParse2('W1', 'W');
	assertParse2('1W1', 'W');
	assertParse2('1WTCX1', 'WTCX');


	assertHandler1('1', [0]);
	assertHandler1('11', [0, 1]);
	assertHandler1('101', [0, 2]);
	assertHandler1('00101', [0, 2]);
	assertHandler1('1000000011', [0, 1, 9]);
	assertHandler1('10000000111', [0, 1, 2, 10]);
	assertHandler1('00000001111', [0, 1, 2, 3]);
	assertHandler2('1Y1Y1', [0, 31, 62]);
	assertHandler2('1ZY1Y1', [0, 31, 93]);


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


	it('clientkey#long', function()
	{
		var db = new DBFile();
		return db.parseFileArray('Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1/Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1/Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1')
			.then(function(data)
			{
				assert.equal(data.length, ClientKey.MAX_GROUP_URI * 3);
			});
	});
});


function assertParse1(key, list)
{
	it('parse#'+key, function()
	{
		var db = new DBFile();
		return db.parseFileArray(key)
			.then(function(filekey)
			{
				assert.deepEqual(filekey, list);
			});
	});
}

function assertParse2(key, key2)
{
	it('parse#'+key, function()
	{
		var db = new DBFile();
		return db.parseFileArray(key)
			.then(function()
			{
				assert(false);
			},
			function(err)
			{
				assert.deepEqual(err.message, 'INVALID REPEAT MARK W/X,'+key2);
			});
	});
}

function assertHandler1(use, list)
{
	it('use#'+use, function()
	{
		var db = new DBFile();
		return db.handle(__dirname, '/data/db.js', parseInt(use, 2).toString(32))
			.then(function(files)
			{
				files.forEach(function(file, index)
				{
					assert.equal(toLinuxPath(file), '/data/'+list[index]);
				});
			});
	});
}

function assertHandler2(use, list)
{
	it('use#'+use, function()
	{
		var db = new DBFile();
		return db.handle(__dirname, '/data/db.js', use)
			.then(function(files)
			{
				files.forEach(function(file, index)
				{
					assert.equal(toLinuxPath(file), '/data/'+list[index]);
				});
			});
	});
}

function assertClientKey(use)
{
	it('clearkey#'+use.join(), function()
	{
		var db = new DBFile();
		return db.handle(__dirname, '/data/db.js', ClientKey.key(use))
			.then(function(files)
			{
				files.forEach(function(file, index)
				{
					assert.equal(toLinuxPath(file), '/data/'+use[index]);
				});
			});
	});
}
