// 生成User标识
function sign(user) {
  if (!user) return null;
  const user_email_md5 = LIBS.util.crypto.md5(user.user_email);
  const user_password_md5 = LIBS.util.crypto.md5(user.user_password);
  return LIBS.util.crypto.md5(user_email_md5 + user_password_md5);
}

// 生成Token
function token(user) {
  const user_id = user.user_id;
  const user_sign = sign(user);
  const token_source = user_id + '\t' + user_sign;
  return LIBS.util.crypto.aes192.encrypt(token_source, CONFIG.cookies_secret);
}

// 验证Token
function verify(token, callback) {
  if (!token) return callback();
  // 解析Token
  const tokens = LIBS.util.crypto.aes192.decrypt(token, CONFIG.cookies_secret).split('\t');
  const user_id = tokens[0];
  const user_sign = tokens[1];
  POOL.query(LIBS.sql({
    table: 'user',
    select: '*',
    where: [
      true,
      ['user_id', user_id],
      ['user_status', VARIABLE.STATUS_ACTIVE]
    ]
  }), function(err, rows) {
    if (err) return callback(err);
    const user = rows[0];
    if (!user || user_sign !== sign(user)) return callback();
    callback(null, user);
  });
}


exports = module.exports = function(req, res, next) {
  if (req.session.user) {
    POOL.query(LIBS.sql({
      table: 'user',
      select: '*',
      where: [
        true,
        ['user_id', req.session.user.user_id],
        ['user_status', VARIABLE.STATUS_ACTIVE]
      ]
    }), function(err, rows) {
      req.session.user = err ? undefined : rows[0];
      next(); // 已经验证过
    });
    return;
  }
  // 登录校验
  verify(req.cookies[CONFIG.user.cookies_login_name], function(err, user) {
    req.session.user = user;
    next();
  });
};

exports.token = token;
exports.verify = verify;
