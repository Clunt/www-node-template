const auth = require('../../../middlewares/auth');


exports = module.exports = function(req, res, next) {
  const email = (req.body.email || '').toLowerCase().trim();
  const password = req.body.password;
  const expires = req.body.expires;
  if (!LIBS.valid.email(email)) {
    return res.api(VARIABLE.ERROR.ILLEGAL_REQUEST);
  }
  if (typeof password !== 'string' || password.length < 6 || password.length > 16) {
    return res.api(VARIABLE.ERROR.ILLEGAL_REQUEST);
  }
  POOL.query(LIBS.sql({
    table: 'user',
    select: '*',
    where: [
      true,
      ['user_email', email],
      ['user_status', '!=', VARIABLE.STATUS_DELETE]
    ],
    limit: 1
  }), function(err, rows) {
    if (err) {
      req.log.error(err);
      return res.api(VARIABLE.ERROR.SYSTEM_ERROR);
    }
    const user = rows[0];
    if (!user) return res.api(VARIABLE.ERROR.EMAIL_UNREGISTERED);
    if (user.user_status !== VARIABLE.STATUS_ACTIVE) return res.api(VARIABLE.ERROR.USER_DISABLED);
    if (user.user_password !== LIBS.util.crypto.password(password, CONFIG.password_salt)) {
      return res.api(VARIABLE.ERROR.PASSWORD_INCORRECT);
    }
    req.session.user = user;
    res.cookie(CONFIG.cookies_login_name, auth.login.token(user), {
      path: '/',
      maxAge: expires ? 31536000000 : null // 1年 1 * 365 * 24 * 60 * 60 * 1000
    });
    POOL.query(LIBS.sql({
      table: 'user',
      update: {
        user_ip_login: req.ip,
        user_time_login: new Date()
      },
      where: ['user_id', user.user_id],
      limit: 1
    }), () => {});
    res.api();
  });
};
