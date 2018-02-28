exports = module.exports = async function(req, res) {
  LIBS.ip(req.query.ip, function(err, country) {
    if (err) return res.api(VARIABLE.ERROR.SYSTEM_ERROR)
    res.api({
      country: country
    });
  });
};
