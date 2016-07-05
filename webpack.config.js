module.exports =
{
	resolve: {
		// root:
		modulesDirectories: [__dirname+'/node_modules']
	},
	entry: {
		'seajs-dbcombo': './src/seajs-dbcombo.js'
	},
	output: {
		path: 'dist',
		filename: '[name].js'
	}
};
