var baseConfig	= require('./browser/karma.js');
var extend		= require('extend');
var pkg			= require('./package.json');

module.exports = function(config)
{
	if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY)
	{
		console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.')
		process.exit(1)
	}

	// Browsers to run on Sauce Labs
	// Check out https://saucelabs.com/platforms for all browser/OS combos
	var customLaunchers =
	{
		sl_chrome:
		{
			base		: 'SauceLabs',
			browserName	: 'chrome',
			platform	: 'Windows 7',
			version		: '35'
		},
		sl_firefox:
		{
			base		: 'SauceLabs',
			browserName	: 'firefox',
			version		: '30'
		},
		sl_ie_11:
		{
			base		: 'SauceLabs',
			browserName	: 'internet explorer',
			platform	: 'Windows 8.1',
			version		: '11'
		}
	};

	config.set(extend(baseConfig,
	{
		port: 4443,
		sauceLabs:
		{
			'public'			: 'public',
			testName			: pkg.name,
			recordScreenshots	: false,
			connectOptions:
			{
				port	: 5757,
				logfile	: 'sauce_connect.log'
			},
		},

		// Increase timeout in case connection in CI is slow
		captureTimeout	: 120000,
		customLaunchers	: customLaunchers,
		browsers		: Object.keys(customLaunchers),
		singleRun		: true
	}));
};
