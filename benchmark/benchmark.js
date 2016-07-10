var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;
var ClientKey = require('../src/dbfile_client');
var seajsCombo = require('./seajs-combo-sethash');

var list21 = [12, 33];
var list22 = ['js/mail/seajs/combo.js', 'js/mail/list/listhandler.js'];

function runHandler(copy, showMsg)
{
	while(copy--)
	{
		list21 = list21.concat(list21);
		list22 = list22.concat(list22);
	}

	ClientKey.key(list21);
	seajsCombo(list22);

	// 添加测试
	suite.add('clientkey', function()
		{
			ClientKey.key(list21);
		})
		.add('seajscombo', function()
		{
			seajsCombo(list22);
		})
		.on('cycle', function(event)
		{
			showMsg(String(event.target));
		})
		.on('complete', function()
		{
			showMsg('Fastest is ' + this.filter('fastest').map('name'));
		})
		.run({ 'async': true });
}


// in node
if (typeof window == 'undefined')
{
	runHandler(10, console.log);
}
else
{
	window.runBenchmarkHandler = runHandler;
}
