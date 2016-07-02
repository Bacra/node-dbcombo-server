var EACH_GROUP_FILE_NUM = exports.EACH_GROUP_FILE_NUM = 31;
var MAX_GROUP_KEY_LENGTH = exports.MAX_GROUP_KEY_LENGTH = Math.pow(2, EACH_GROUP_FILE_NUM).toString(32).length;
// 受到文件夹长度限制
// http://stackoverflow.com/questions/14500893/is-the-255-char-limit-for-filenames-on-windows-and-unix-the-whole-path-or-part
var MAX_GROUP_URI = exports.MAX_GROUP_URI = 250/MAX_GROUP_KEY_LENGTH | 0;

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
// 除了32位的字符，转换后有如下特殊字符
// Z  分组无任何数据，占位使用
// Y  分组转成字符串之后，长度不足MAX_GROUP_KEY_LENGTH，补位
// /  数据可能超过文件名长度限制，用来分割
// X  当有很多Z的时候，为了美化，进行repeat处理
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
			if (continuousEmptyGroups == 1)
				str += 'Z';
			else if (continuousEmptyGroups == 2)
				str += 'ZZ';
			else
				str += continuousEmptyGroups+'X';

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

