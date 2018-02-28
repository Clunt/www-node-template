const path = require('path');
const mkdirp = require('mkdirp');
const bunyan = require('bunyan');
const expressBunyan = require('express-bunyan-logger');
const RotatingFileStream = require('bunyan-rotating-file-stream');
const config = require('./config');

const ENV = config.environment;


const loggers = {};
mkdirp.sync(path.join(__dirname, 'logs'));

function createLogger(category) {
  if (loggers[category]) return loggers[category];
  var folderPath = path.join(__dirname, 'logs', category.replace(/\./g, '/'));
  mkdirp.sync(folderPath);
  const logger = bunyan.createLogger({
    name: category,
    serializers: bunyan.stdSerializers,
    stream: new RotatingFileStream({
      path: path.join(folderPath, '%Y-%m-%d.%N.log'),
      period: '1d',
      threshold: '10m',
      rotateExisting: true,
      gzip: true
    })
  });

  if (ENV === 'development') {
    logger.addStream({
      stream: process.stdout,
      level: 'debug'
    });
  }

  if (category.indexOf('http') === 0) {
    loggers[category] = expressBunyan({
      logger: logger
    });
  } else {
    loggers[category] = logger;
  }

  return loggers[category];
}

exports = module.exports = createLogger('log');
exports.get = createLogger;
exports.http = createLogger('http');
