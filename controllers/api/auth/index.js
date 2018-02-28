exports.login = require('./login');


exports.logout = function(req, res) {
  req.session.user = undefined;
  res.clearCookie(CONFIG.cookies_login_name, { path: '/' });
  res.api();
};
