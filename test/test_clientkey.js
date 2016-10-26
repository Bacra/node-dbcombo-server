// require('debug').enable('*');

var assert		= require('assert');
var ClientKey	= require('../browser/src/dbfile_client');
var toLinuxPath	= require('../lib/utils').toLinuxPath;

describe('clientkey', function()
{
	it('base', function()
	{
		assert.equal(ClientKey.key([0]), 'Y1');
		assert.equal(ClientKey.key([1]), 'Y2');
		assert.equal(ClientKey.key([0,1]), 'Y3');
		assert.equal(ClientKey.key([0, 30]), '1000001');
		assert.equal(ClientKey.key([0, 31]), 'Y1Y1');
		assert.equal(ClientKey.key([0, 31, 92, 93, 94]), 'Y31000000Y1Y1');
		assert.equal(ClientKey.key([1000]), 'Y80W32X');
		assert.equal(ClientKey.key([2000]), 'Y2000W29X/W35X');
		assert.equal(ClientKey.key([5000]), 'Yg0W21X/W35X/W35X/W35X/W35X');
	});


	it('clientkey#long', function()
	{
		var i = ClientKey.MAX_GROUP_URI * 3;
		var arr = [];
		while(i--)
		{
			arr.push(i * ClientKey.EACH_GROUP_FILE_NUM);
		}

		var key = ClientKey.key(arr);
		assert.equal(key, 'Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1/Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1/Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1Y1');
	});


	it('clientkey#long2', function()
	{
		var i = ClientKey.MAX_GROUP_URI * 2;
		var arr = [];
		while(i--)
		{
			arr.push(i * ClientKey.EACH_GROUP_FILE_NUM+i);
		}

		var key = ClientKey.key(arr);

		assert.equal(key, 'Y40Y20/Y10YgY8Y4Y2Y1Z1000000Yg00000Y800000Y400000Y200000Y100000Yg0000Y80000Y40000Y20000Y10000Yg000Y8000Y4000Y2000Y1000Yg00Y800Y400Y200Y100Yg0Y80Y40Y20Y10YgY8/Y4Y2Y1Z1000000Yg00000Y800000Y400000Y200000Y100000Yg0000Y80000Y40000Y20000Y10000Yg000Y8000Y4000Y2000Y1000Yg00Y800Y400Y200Y100Yg0Y80Y40Y20Y10YgY8Y4Y2Y1');
	});
});

