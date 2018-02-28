const request = require('request');
const logger = require('../logger');
const log = logger.get('ip');


exports = module.exports = function(ip, callback) {
  let times = 0;
  const url = 'http://ip.taobao.com/service/getIpInfo.php?ip=' + ip;
  function retry() {
    if (times < 5) {
      request(url, handle);
    } else {
      callback(true);
    }
  }
  function handle(err, response, body) {
    times += 1;
    if (err) {
      log.error(err, 'locate ip error: %s', ip);
      return retry();
    }
    if (!response || response.statusCode !== 200) {
      log.error('locate ip(%s) server response not 200.', ip);
      return retry();
    }

    let result;
    try {
      result = JSON.parse(body);
    } catch(e) {
      log.error(e, 'locate ip(%s) response body is invalid json string.', ip);
      return retry();
    }
    if (!result || result.code !== 0) {
      log.error(result, 'locate ip(%s) error.', ip);
      return retry();
    }
    const data = result.data || {};
    let location = [];
    callback(null, String(data.country).replace(/X/g, '').trim());
    // location.push(data.country);
    // data.region && location.push(data.region);
    // data.city && data.city !== data.region && location.push(data.city);
    // callback(null, location.join(' ').replace(/X/g, '').trim());
  }
  request(url, handle);
};
