module.exports =
{
	resolve: {
		// root:
		modulesDirectories: [__dirname+'/node_modules']
	},
	entry: {
		'seajs-dbcombo': './browser/src/seajs-dbcombo.js',
		'benchmark4browser': './benchmark/benchmark.js'
	},
	output: {
		path: 'browser/dist',
		filename: '[name].js'
	}
};
