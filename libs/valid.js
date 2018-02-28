const variable = require('../variable');

exports.subdomain = function(str) {
  const reg = /^[-a-z0-9]+$/;
  return reg.test(str) && str.length < 100;
};

exports.email = function(str) {
  const reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return reg.test(str) && str.length < 100;
};

exports.number = function(str) {
  const reg = /^\d+$/;
  return reg.test(str);
};

// 正整数
exports.integerPositive = function(str) {
  const reg = /^[1-9]+[0-9]*$/;
  return reg.test(String(str));
};

exports.timestamp = function(str) {
  const reg = /^-?\d+$/;
  return reg.test(str);
};

// 验证存在多语言
exports.language = function(language, exist) {
  // exist 只要有一个语言存在即可
  if (typeof language !== 'object') return false;
  let count = 0;
  for (var i = 0; i < variable.LANGUAGE_LIST.length; i++) {
    if (language[variable.LANGUAGE_LIST[i]]) {
      if (exist) return true;
      count += 1;
    } else {
      if (!exist) return false;
    }
  }
  return count === variable.LANGUAGE_LIST.length;
};
