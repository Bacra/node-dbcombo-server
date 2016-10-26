// Karma configuration
// Generated on Wed Oct 26 2016 20:41:55 GMT+0800 (中国标准时间)

module.exports = {

	// base path that will be used to resolve all patterns (eg. files, exclude)
	basePath: '',


	// frameworks to use
	// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
	frameworks: ['mocha', 'browserify'],


	// list of files / patterns to load in the browser
	files: [
		'test/test_clientkey.js'
	],


	// list of files to exclude
	exclude: [],


	// preprocess matching files before serving them to the browser
	// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
	preprocessors:
	{
		'test/test_clientkey.js': ['browserify']
	},


	// test results reporter to use
	// possible values: 'dots', 'progress'
	// available reporters: https://npmjs.org/browse/keyword/karma-reporter
	reporters: ['progress'],


	// web server port
	port: 9876,


	// enable / disable colors in the output (reporters and logs)
	colors: true
};
