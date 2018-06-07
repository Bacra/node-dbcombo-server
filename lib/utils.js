'use strict';

exports.isOverflowPath = isOverflowPath;
function isOverflowPath(p)
{
	return p.substr(0,2) == '..';
}

var linuxReg = /\\/g;
exports.toLinuxPath = toLinuxPath;
function toLinuxPath(p)
{
	return p.replace(linuxReg, '/');
}
