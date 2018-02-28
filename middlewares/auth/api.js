exports = module.exports = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.api(VARIABLE.error_code.NOT_AUTH);
  }
};
