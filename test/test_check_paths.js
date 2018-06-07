'use strict';

var assert = require('assert');
var Checker = require('../lib/check_paths').Checker;

describe('chekPaths', function()
{
	it('limitFiles', function()
		{
			var checker = new Checker({limitFiles: 3});
			assert.doesNotThrow(function()
				{
					checker.check(['file1.js', 'file2.js']);
				});
			assert.throws(function()
				{
					checker.check(['file1.js', 'file2.js', 'file3.js', 'file4.js']);
				});
		});


	it('enableMulitExtname', function()
		{
			// 关闭
			var checker = new Checker({enableMulitExtname: false});
			assert.doesNotThrow(function()
				{
					checker.check(['file1.js', 'file2.js']);
				});
			assert.throws(function()
				{
					checker.check(['file1.js', 'file2.css']);
				});

			// 开启
			var checker = new Checker({enableMulitExtname: true});
			assert.doesNotThrow(function()
				{
					checker.check(['file1.js', 'file2.js']);
				});
			assert.doesNotThrow(function()
				{
					checker.check(['file1.js', 'file2.css']);
				});
		});


	it('limitExtname', function()
		{
			var checker = new Checker({limitExtname: ['js']});
			assert.doesNotThrow(function()
				{
					checker.check(['file1.js', 'file2.js']);
				});
			assert.throws(function()
				{
					checker.check(['file1.js', 'file2.css']);
				});
			assert.throws(function()
				{
					checker.check(['file1.css', 'file2.css']);
				});
		});
});
