const UA = require('ua-device');


function formatVersion(version) {
  return (version || '').replace(/(((^|\.)[^.]+){3}).*$/, '$1');
}

exports = module.exports = function(userAgent) {
  const ua = new UA(userAgent);
  return {
    ua: ua,
    info: {
      program: ua.browser.name || '',
      program_version: formatVersion((ua.browser.version || {}).original),
      device: ua.device.model || ua.os.name,
      device_version: ua.device.model ? '' : formatVersion((ua.os.version || {}).original)
    }
  };
};