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
		assert.equal(ClientKey.key([1000]), 'Y8032X');
	});
	doAssert3([0]);
	doAssert3([0, 31]);
	doAssert3([0, 31, 92, 93, 94]);


	it('clientkey#long', function()
	{
		var i = ClientKey.MAX_GROUP_URI * 3;
		var arr = [];
		while(i--)
		{
			arr.push(i * ClientKey.EACH_GROUP_FILE_NUM);
		}

		var db = new DBFile();
		var key = ClientKey.key(arr);
		assert.equal(key, 'Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1/Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1/Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1');

		return db.parseFileArray(key)
			.then(function(data)
			{
				assert.equal(data.length, ClientKey.MAX_GROUP_URI * 3);
			});
	});


	it('clientkey#long2', function()
	{
		var i = ClientKey.MAX_GROUP_URI * 2;
		var arr = [];
		while(i--)
		{
			arr.push(i * ClientKey.EACH_GROUP_FILE_NUM+i);
		}

		var db = new DBFile();
		var key = ClientKey.key(arr);

		assert.equal(key, 'Y40Y20/Y10YgY8Y4Y2Y1Z1000000Yg00000Y800000Y400000Y200000Y100000Yg0000Y80000Y40000Y20000Y10000Yg000Y8000Y4000Y2000Y1000Yg00Y800Y400Y200Y100Yg0Y80Y40Y20Y10YgY8/Y4Y2Y1Z1000000Yg00000Y800000Y400000Y200000Y100000Yg0000Y80000Y40000Y20000Y10000Yg000Y8000Y4000Y2000Y1000Yg00Y800Y400Y200Y100Yg0Y80Y40Y20Y10YgY8Y4Y2Y1');
	});
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
