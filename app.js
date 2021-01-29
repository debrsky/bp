const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('trust proxy', 1); // trust first proxy

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SESSION_SECRET;
if (!secret) {
  console.error('No SESSION_SECRET environment variable.');
  process.exit(1);
}

app.use(session({
  store: new FileStore({ path: './storage/sessions' }),
  secret,
  resave: true,
  saveUninitialized: false,
  cookie: { path: '/', httpOnly: true, secure: false, maxAge: null },
  ttl: 3600,
  reapInterval: 3600,
  name: 'sessionId'
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // eslint-disable-line

  // render the error page
  res.status(err.status || 500);

  res.render('error');
});

module.exports = app;
