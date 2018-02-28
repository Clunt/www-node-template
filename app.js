const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const helmet = require('helmet');
const responseApi = require('./middlewares/response-api');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

global.SYNC = {};
const config = global.CONFIG = require('./config');
const logger = global.LOGGER = require('./logger');
const libs = global.LIBS = require('./libs');
const variable = global.VARIABLE = require('./variable');
const mysql = global.MYSQL = require('mysql');
const pool = global.POOL = mysql.createPool(Object.assign({
  multipleStatements: true
}, config.database));
const poolSync = global.SYNC.POOL = require('./libs/pool-sync')(pool);


const app = global.APP = express();

app.set('environment', config.environment);
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'hbs');
app.set('trust proxy', true);
app.use(helmet());
app.use(bodyParser.urlencoded({
  extended: true,
  verify: function(req, res, buf, encoding) {
    req.bufBody = buf;
    req.rawBody = buf.toString(encoding);
  }
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  name: config.session_name,
  secret: config.session_secret,
  resave: false,
  saveUninitialized: true,
  store: new FileStore({
    path: config.session_path
  }),
  cookie: {}
}));
app.use(logger.http);
app.use(responseApi);

const router = require('./router');
app.use(router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // handle CSRF token errors here
  if (err.code === 'EBADCSRFTOKEN') {
    err.code = VARIABLE.ERROR.ILLEGAL_REQUEST;
  }
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  const code = typeof err.code === 'number' ? err.code : VARIABLE.ERROR.SYSTEM_ERROR;
  const status = err.status || 500;
  res.format({
    'text/plain': function() {
      res.status(status).send('ERROR');
    },
    'text/html': function() {
      res.status(status).render('public/error');
    },
    'application/json': function() {
      res.status(status).json({
        code: code,
        msg: '',
        data: {}
      });
    },
    'default': function() {
      res.status(status).send('ERROR');
    }
  });
});

module.exports = app;
