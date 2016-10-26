var ClientKey = require('./dbfile_client.js');

var Module = seajs.Module;
var FETCHING = Module.STATUS.FETCHING;

var data = seajs.data;
var DBComboIndexData = data.DBComboIndexData = {};
var DBComboIndexHandler;

seajs.on('load', setComboHash);
seajs.on('fetch', setRequestUri);
seajs.on('config', setConfig);

seajs.DBComboKey = ClientKey.key;


var urlClearReg = /\?.*$/;
function DBComboIndexHandlerDefault(uri)
{
	if (!data.DBComboFileIndex) return;
	return data.DBComboFileIndex[uri.replace(urlClearReg, '')];
}

function setConfig(options)
{
	if (typeof options.DBComboFileIndex == 'function')
	{
		DBComboIndexHandler = options.DBComboFileIndex;
	}
	else if (options.DBComboFileIndex)
	{
		DBComboIndexHandler = DBComboIndexHandlerDefault;
	}
}


function setComboHash(uris)
{
	var len = uris.length;
	var needComboUris = []

	for (var i = 0; i < len; i++)
	{
		var uri = uris[i]
		if (DBComboIndexData[uri]) continue;

		var mod = Module.get(uri);

		// Remove fetching and fetched uris, excluded uris, combo uris
		if (mod.status < FETCHING && !isExcluded(uri) && !isComboUri(uri))
		{
			needComboUris.push(uri);
		}
	}

	if (needComboUris.length > 1)
	{
		paths2hash(needComboUris);
	}
}


function setRequestUri(data2)
{
	if (data.DBComboFile)
	{
		var info = DBComboIndexData[data2.uri];
		if (info && info.indexs)
		{
			// 下发index，其他fetch的可能也要用
			data2.DBComboFileInfo = info;
			if (info.indexs.length > 1)
			{
				data2.requestUri = info.requestUri || data.DBComboFile+'/'+info.indexStr+info.type;
				return;
			}
		}

		if (data.DBComboExcludeUriHandler)
		{
			data2.requestUri = data.DBComboExcludeUriHandler(data2.uri);
		}
	}
}

function paths2hash(files)
{
	var group = files2group(files)
	for (var i = group.length; i--;)
	{
		setHash(group[i]);
	}
}

function setHash(files)
{
	var indexs = [];
	var inList = [];
	for (var i = files.length; i--;)
	{
		var fileIndex = DBComboIndexHandler(files[i]);
		if (fileIndex || fileIndex === 0)
		{
			inList.push(files[i]);
			indexs.push(fileIndex);
		}
		else if (data.debug)
		{
			console.log('no file index:'+files[i]);
		}
	}

	if (inList.length)
	{
		var result = {indexs: indexs, indexStr: seajs.DBComboKey(indexs), type: getExt(inList[0])};
		for (var i = inList.length; i--;)
		{
			DBComboIndexData[inList[i]] = result;
		}
	}
}

//
//  ["a.js", "c/d.js", "c/e.js", "a.css", "b.css", "z"]
// ==>
//  [ ["a.js", "c/d.js", "c/e.js"], ["a.css", "b.css"] ]
//

function files2group(files)
{
	var group = []
	var hash = {}

	for (var i = 0, len = files.length; i < len; i++)
	{
		var file = files[i]
		var ext = getExt(file)
		if (ext)
		{
			(hash[ext] || (hash[ext] = [])).push(file)
		}
	}

	for (var k in hash)
	{
		if (hash.hasOwnProperty(k))
		{
			group.push(hash[k])
		}
	}

	return group
}

function getExt(file)
{
	var p = file.lastIndexOf(".");
	return p >= 0 ? file.substring(p) : "";
}

function isExcluded(uri)
{
	if (!data.DBComboFile) return true;

	if (data.DBComboExcludes)
	{
		return data.DBComboExcludes.test ?
			data.DBComboExcludes.test(uri) :
			data.DBComboExcludes(uri);
	}
}

function isComboUri(uri)
{
	var s1 = data.DBComboFile;
	return s1 && uri.substr(0, s1.length+1) == s1+'/';
}

