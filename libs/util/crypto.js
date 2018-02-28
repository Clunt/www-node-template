const crypto = require('crypto');


exports.md5 = function(str) {
  return crypto.createHash('md5').update(str).digest('hex');
};

exports.sha1 = function(str, key) {
  return crypto.createHmac('sha1', key).update(str).digest('base64');
};

exports.password = function(password, salt) {
  return exports.md5(exports.md5(password + salt) + salt);
};

exports.aes192 = {
  encrypt: function(str, secret) {
    let cipher = crypto.createCipher('aes192', secret);
    let enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
  },
  decrypt: function(str, secret) {
    let decipher = crypto.createDecipher('aes192', secret);
    let dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }
};


exports.base64 = {
  encrypt: function(str) {
    return new Buffer(String(str)).toString('base64');
  },
  decrypt: function(str) {
    return new Buffer(String(str), 'base64').toString();
  }
};
