exports = module.exports = function(pool) {
  return async function(sql, data) {
    return new Promise(function(reslove, reject) {
      pool.query(sql, data, function(err, result) {
        if (err) {
          reject(err);
        } else {
          reslove(result);
        }
      });
    });
  };
};
