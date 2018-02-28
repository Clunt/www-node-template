const variable = require('../variable');


exports.line = function(str) {
  return String(str || '').replace(/\n/g, '').replace(/\r/g, '');
};

exports.language = function(language, line) {
  if (typeof language !== 'object') return {};
  var result = {};
  variable.LANGUAGE_LIST.forEach((lang) => {
    if (typeof language[lang] === 'string') {
      result[lang] = language[lang].trim();
      if (line) {
        result[lang] = exports.line(result[lang]);
      }
    }
  });
  return result;
};

exports.url = function(str) {
  return encodeURIComponent(
    (str || '').replace(/\s/g, '-').replace(/[^-a-zA-Z0-9]/g, '')
  )
};
