const URL = require('url').URL;


exports = module.exports = function(path, host) {
  return String(new URL(path, host));
};
