var EACH_GROUP_FILE_NUM = exports.EACH_GROUP_FILE_NUM = 31;
var MAX_GROUP_KEY_LENGTH = exports.MAX_GROUP_KEY_LENGTH = Math.pow(2, EACH_GROUP_FILE_NUM).toString(32).length;

var OFFSET2INDEX = (function()
	{
		var i = EACH_GROUP_FILE_NUM;
		var arr = [];
		do
		{
			arr[i-1] = Math.pow(2, i) - Math.pow(2, i-1);
		}
		while(--i);

		return arr;
	})();



exports.key = key;
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
	for(var i = groups.length; i--;)
	{
		if (groups[i])
		{
			var tmp = groups[i].toString(32);
			if (tmp.length < 7) tmp = 'Y'+tmp;
			str += tmp;
		}
		else
			str += 'Z';
	}

	// console.log('groups len:%d, %o, url:%s', groups.length, groups, str);

	return str;
}

