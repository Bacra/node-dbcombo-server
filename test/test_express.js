'use strict';

var _		= require('lodash');
var Promise	= require('bluebird');
var assert	= require('assert');
var handler	= require('../express');
var expr	= require('express');
var http	= require('http');
var debug	= require('debug')('dbcombo:test_express');
var request	= require('request');
var PORT	= 4495;
var HOST	= 'http://127.0.0.1:'+PORT+'/static/';
var toLinuxPath = require('../lib/utils').toLinuxPath;

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

		svr = http.createServer(app);
		svr.listen(PORT, function()
			{
				debug('proxy ok:%s', HOST);
				done();
			});
	});

	after(function()
	{
		svr.close();
	});

	var list =
	{
		'file/db.js_db/3/V.js':
			{
				content: '01',
				list: ['/file/0.js', '/file/1.js']
			},
		'file/db.js_db/12/V.js':
			{
				content: '15',
				list: ['/file/1.js', '/file/5.js']
			},
		'file/??1.js,2.js,3.js':
			{
				content: '123',
			},
		'file/??1.js':
			{
				content: '1',
			},
	};

	_.each(list, function(data, uri)
	{
		assertRequestBody(uri, data.content);
	});

	_.each(list, function(data, uri)
	{
		if (data.list) assertRequestList(uri, data.list);
	});

	var list2 =
	{
		'file/db.js': 404,
		'file/1.js': 404,
		'file/db.js_db/404/V.js': 404,
		'data/db.js_db/404/V.js': 500,
		'file/??404.js': 500,
		'file/??1.js,2.css': 500
	};

	_.each(list2, function(statusCode, uri)
	{
		assertRequestStatusCode(uri, statusCode);
	});
});


function assertRequestBody(uri, content)
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
			});
	});
}

function assertRequestList(uri, list)
{
	it('requestlist#'+uri, function()
	{
		return new Promise(function(resolve, reject)
			{
				var url = HOST+uri+'$debug_list';
				debug('request url:%s', url);

				request.get(url, function(err, response, body)
				{
					if (err) return reject(err);
					if (response.statusCode != 200) return reject('not 200,'+response.statusCode);
					assert.deepEqual(JSON.parse(body).map(function(file)
						{
							return toLinuxPath(file);
						}),
						list);
					resolve();
				});
			});
	});
}


function assertRequestStatusCode(uri, statusCode)
{
	it('requestlist#'+uri, function()
	{
		return new Promise(function(resolve, reject)
			{
				var url = HOST+uri;
				debug('request url:%s', url);

				request.get(url, function(err, response)
				{
					if (err) return reject(err);
					assert.equal(response.statusCode, statusCode);
					resolve();
				});
			});
	});
}
