var assert	= require('assert');
var handler	= require('../express');
var expr	= require('express');
var http = require('http');
var debug	= require('debug')('combo:test_express');
var request	= require('request');
var PORT	= 349;
var HOST	= 'http://127.0.0.1:'+PORT+'/static/';

describe('expressHandler', function()
{
	var svr;
	before(function(done)
	{
		var app = expr();
		app.use('/static', handler(
			{
				root: __dirname+'/',
				enabledDBParser: true,
				enabledMultiParser: true
			}));

		svr = http.createServer();
		svr.listen(PORT, function()
			{
				debug('proxy ok:%s', HOST);
				done();
			});
		app.listen(svr);
	});

	after(function()
	{
		svr.close();
	});

	var list = {
		'file/db.js/3.js': '56',
		'file/db.js/12.js': '15',
		'file/??1.js,2.js,3.js': '123'
	};

	for(var uri in list)
	{
		doAssert(uri, list[uri]);
	}
});


function doAssert(uri, content)
{
	it('request#'+uri, function()
	{
		return new Promise(function(resolve, reject)
			{
				var url = HOST+uri;
				debug('request url:%s', url);

				request.get(url, function(err, response, body)
				{
					if (err) return reject(err);
					if (response.statusCode != 200) return reject('not 200,'+response.statusCode);
					assert.equal(body, content);
					resolve();
				});
			})
	});
}

