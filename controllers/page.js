exports.home = function(req, res) {
  if (!req.session.user) return res.redirect('/login');
  res.render('home', {
  });
};

exports.login = function(req, res) {
  res.render('auth/login');
};

exports.logout = function(req, res) {
  req.session.user = undefined;
  res.clearCookie(CONFIG.cookies_login_name, {path: '/'});
  res.render('auth/logout');
};
