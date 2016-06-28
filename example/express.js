require('debug').enable('combo*');

var expr = require('express');
var app = expr();
var combo = require('../express');
var PORT = 8782;

app.use(combo(
	{
		root: __dirname+'/../test/',
		enabledDBParser: true,
		enabledMultiParser: true
	}));
app.listen(PORT);

console.log('listen:'+PORT);

// http://127.0.0.1:8782/file/db.js/3.js
// http://127.0.0.1:8782/file/db.js/12.js
// http://127.0.0.1:8782/file/db.js/8812.js
// http://127.0.0.1:8782/file??1.js,2.js,3.js
