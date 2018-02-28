exports.crypto = require('./crypto');
exports.date = require('./date');


exports.randomString = function(str, len, readable) {
  if (typeof str === 'number') {
    readable = len;
    len = str;
    str = '';
  }
  let defaultStr = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  if (!readable) {
    defaultStr += 'ILilOo01'
  }
  str = str || defaultStr;
  len = len || 32;
  const maxPos = str.length - 1;
  let result = '';
  for (let i = 0; i < len; i += 1) {
    result += str.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
};

exports.parseJSON = function(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return undefined;
  }
};

exports.stringifyJSON = function(json, callback) {
  try {
    return JSON.stringify(json);
  } catch (e) {
    return null;
  }
};
