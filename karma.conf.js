// Karma configuration
// Generated on Wed Oct 26 2016 20:41:55 GMT+0800 (中国标准时间)

var os = require('os');
var baseConfig = require('./browser/karma.js');
var extend = require('extend');

module.exports = function(config)
{
	var browsers = ['Chrome', 'Firefox'];
	var platform = os.platform();

	if (platform == 'win32')
		browsers.push('IE');
	else if (platform == 'darwin')
		browsers.push('Safari');


	config.set(extend(baseConfig,
	{
		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		// browsers: ['Chrome'],
		browsers: browsers,


		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	}));
};
