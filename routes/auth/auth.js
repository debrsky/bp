const express = require('express');
const router = express.Router();

const auth = require('../../lib/auth');
const config = require('../../config');
const users = require('../../lib/users');

router.get('/logout', function (req, res, next) {
  req.logout();

  if (req.session) {
    res.clearCookie(config.session.name);
    return req.session.destroy((err) => {
      if (err) return next(err);
      res.redirect(req.baseUrl);
    });
  }
  res.redirect(req.baseUrl);
});

router.post(
  '/login',
  async (req, res, next) => {
    // обработка регистрации
    try {
      const { username, password, reg } = req.body;
      if (reg) {
        await users.upsertUser({ name: username, login: username, password });
      }
      return next();
    } catch (err) {
      return next(err);
    }
  },
  auth.passport.authenticate('local', {
    successRedirect: null,
    failureRedirect: null,
    failureFlash: false,

    failWithError: true
  }),
  (req, res, next) => {
    res.send(JSON.stringify(req.user));
  }
);

['vk', 'ya', 'mailru', 'google'].forEach((provider) => {
  router.get(`/${provider}`, auth.passport.authenticate(provider));
  router.get(
    `/${provider}/callback`,
    auth.passport.authenticate(provider, { failWithError: true }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );
});

router.get('/', async function (req, res, next) {
  res.render('auth', { title: 'Express', page: 'auth' });
});

module.exports = router;
