/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var ClientKey = __webpack_require__(12);

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



/***/ },

/***/ 12:
/***/ function(module, exports) {

	var EACH_GROUP_FILE_NUM = exports.EACH_GROUP_FILE_NUM = 31;
	var MAX_GROUP_KEY_LENGTH = exports.MAX_GROUP_KEY_LENGTH = Math.pow(2, EACH_GROUP_FILE_NUM).toString(32).length;
	// 受到文件夹长度限制
	// http://stackoverflow.com/questions/14500893/is-the-255-char-limit-for-filenames-on-windows-and-unix-the-whole-path-or-part
	var MAX_GROUP_URI = exports.MAX_GROUP_URI = 250/MAX_GROUP_KEY_LENGTH | 0;
	var MAX_NOT_REPEAT_GROUP_MARK = 4;

	// console.log('DEFIND,%d,%d,%d,%d', EACH_GROUP_FILE_NUM, MAX_GROUP_KEY_LENGTH, MAX_GROUP_URI, MAX_NOT_REPEAT_GROUP_MARK);

	var OFFSET2INDEX = (function()
		{
			var i = EACH_GROUP_FILE_NUM;
			var arr = [];
			while(i--)
			{
				arr[i] = 1 << i;
			}

			return arr;
		})();


	var MARK_Z_GROUPS = (function()
		{
			var arr = [];
			var str = '';
			for(var i = 1; i < MAX_NOT_REPEAT_GROUP_MARK; i++)
			{
				arr[i] = (str += 'Z');
			}

			return arr;
		})();


	exports.key = key;

	// 生成urlkey，高位→低位
	// 除了32位的字符，转换后有如下特殊字符
	// Z  分组无任何数据，占位使用
	// Y  分组转成字符串之后，长度不足MAX_GROUP_KEY_LENGTH，补位
	// /  数据可能超过文件名长度限制，用来分割
	// W...X  当有很多Z的时候，为了美化，进行repeat处理; ...表示重复的次数
	function key(indexs)
	{
		var groups = [];
		for(var i = indexs.length; i--;)
		{
			var index = indexs[i];
			var groupIndex = index/EACH_GROUP_FILE_NUM | 0;
			var lowOffset = index%EACH_GROUP_FILE_NUM;
			var indexVal = OFFSET2INDEX[lowOffset];

			// console.log('index:%d groupIndex:%d indexVal:%d lowOffset:%d file:%s', index, groupIndex, indexVal, lowOffset);
			groups[groupIndex] = (groups[groupIndex] || 0) | indexVal;
		}

		var str = '';
		var continuousEmptyGroups = 0;

		function ZXHandler()
		{
			if (continuousEmptyGroups)
			{
				if (MARK_Z_GROUPS[continuousEmptyGroups])
					str += MARK_Z_GROUPS[continuousEmptyGroups];
				else
					str += 'W'+continuousEmptyGroups+'X';

				continuousEmptyGroups = 0;
			}
		}
		for(var i = groups.length; i--;)
		{
			if (groups[i])
			{
				ZXHandler();
				var tmp = groups[i].toString(32);
				if (tmp.length < 7) tmp = 'Y'+tmp;
				str += tmp;
			}
			else
			{
				continuousEmptyGroups++;
			}

			if (i && !(i%MAX_GROUP_URI))
			{
				ZXHandler();
				str += '/';
			}
		}

		ZXHandler();

		// console.log('groups len:%d, %o, url:%s', groups.length, groups, str);

		return str;
	}


/***/ }

/******/ });