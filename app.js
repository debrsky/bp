const config = require('./config');
const users = require('./lib/users');

const createError = require('http-errors');
const express = require('express');
const responseTime = require('response-time');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const logger = require('morgan');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(
  new LocalStrategy(function (login, password, done) {
    let user = { name: login, login, password };

    (async () => {
      user = await users.findUser(user);
      if (!user || (await users.calcKey(password, user.salt)) !== user.key) {
        return done(null, false, { message: 'username not found' });
      }
      return done(null, user);
    })().catch((err) => done(err));
  })
);
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await users.findUser({ id });
    if (!user) throw new Error();
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');

const app = express();
app.use(responseTime());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('trust proxy', 1); // trust first proxy

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const secret = config.session?.secret;
if (!secret) {
  console.error('No SESSION_SECRET environment variable.');
  process.exit(1);
}

app.use(
  session({
    store: new FileStore({ path: 'storage/sessions' }),
    secret,
    resave: true,
    saveUninitialized: false,
    cookie: { path: '/', httpOnly: true, secure: false, maxAge: null },
    ttl: 3600,
    reapInterval: 3600,
    retries: 5,
    name: config.session.name
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  }
  return next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/profile', profileRouter);

app.get('/passport/login', (req, res, next) => {
  res.render('passport/login');
});
app.post(
  '/passport/login',
  passport.authenticate('local', {
    successRedirect: null,
    failureRedirect: null,
    failureFlash: false
  }),
  (req, res, next) => {
    res.sendStatus(200);
  }
);

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

  if (err.status === 500) {
    console.error(err);
  }
  res.render('error');
});

module.exports = app;
