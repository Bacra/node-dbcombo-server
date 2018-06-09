'use strict';

var assert = require('assert');
var urlCombo = require('../lib/url_combo_parser');

describe('UrlComboParser', function()
{
	it('MultiFiles', function()
	{
		var parser = new urlCombo.MultiFiles();
		var files = parser.parse('/static/js/combo??a.js,b/b.js,../c.js');

		assert.equal(files.join('|').replace(/\\/g, '/'), '/static/js/combo/a.js|/static/js/combo/b/b.js|/static/js/c.js');
	});

	it('DBFiles', function()
	{
		var parser = new urlCombo.DBFiles();

		// 新url
		var info = parser.parse('/static/js/db.js_db/efe20er24/V.js');
		assert.equal(info.db.replace(/\\/g, '/'), '/static/js/db.js');
		assert.equal(info.list, 'efe20er24');

		// 旧url
		var info = parser.parse('/static/js/db.js_db/efe20er24.js');
		assert.equal(info.db.replace(/\\/g, '/'), '/static/js/db.js');
		assert.equal(info.list, 'efe20er24');
	});
});
