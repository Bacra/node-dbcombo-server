// require('debug').enable('*');

var assert = require('assert');
var DBFile = require('../lib/dbfile').DBFile;
var ClientKey = require('../src/dbfile_client');

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
	assertParse1('1W4X1', [1, , , , , 1]);
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

	it('clientkey', function()
	{
		assert.equal(ClientKey.key([0]), 'Y1');
		assert.equal(ClientKey.key([1]), 'Y2');
		assert.equal(ClientKey.key([0,1]), 'Y3');
		assert.equal(ClientKey.key([0, 30]), '1000001');
		assert.equal(ClientKey.key([0, 31]), 'Y1Y1');
		assert.equal(ClientKey.key([1000]), 'Y80W32X');
		assert.equal(ClientKey.key([2000]), 'Y2000W29X/W35X');
		assert.equal(ClientKey.key([5000]), 'Yg0W21X/W35X/W35X/W35X/W35X');
	});
	assertClientKey([0]);
	assertClientKey([0, 31]);
	assertClientKey([0, 31, 92, 93, 94]);


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
					assert.equal(file, '/data/'+list[index]);
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
					assert.equal(file, '/data/'+list[index]);
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
					assert.equal(file, '/data/'+use[index]);
				});
			});
	});
}
