exports = module.exports = function(req, res, next) {
  // api(code, message, data)
  // api(code, message)
  // api(code, data)
  // api(code)
  // api(data)
  // api()
  res.api = function(code, message, data) {
    if (typeof code === 'object') {
      data = code;
      code = 0;
    } else if (typeof code === 'undefined') {
      code = 0;
    } else if (typeof message === 'object') {
      data = message;
      message = undefined;
    }
    code = code || 0;
    message = message || '';
    data = data || {};
    this.json({
      code: code,
      msg: message,
      data: data
    });
  }.bind(res);
  next();
};
