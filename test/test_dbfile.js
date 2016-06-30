// require('debug').enable('*');

var assert = require('assert');
var DBFile = require('../lib/dbfile').DBFile;

describe('dbfile', function()
{
	doAssert('1', [0]);
	doAssert('11', [0, 1]);
	doAssert('101', [0, 2]);
	doAssert('00101', [0, 2]);
	doAssert('1000000011', [0, 1, 9]);
	// doAssert('10000000111', [0, 8, 9]);
	doAssert('00000001111', [0, 1, 2, 3]);

	it('overflow#10000000111', function()
	{
		var db = new DBFile();
		return db.handle(__dirname, '/data/db.js', parseInt('10000000111', 2).toString(32))
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
	})
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
