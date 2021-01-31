const express = require('express');
const router = express.Router();

const querystring = require('querystring');

const config = require('../../config');
const users = require('../../lib/users');

router.use('/vk', require('./vk'));

router.get('/logout', function (req, res, next) {
  if (req.session) {
    res.clearCookie('sessionId');
    return req.session.destroy((err) => {
      if (err) return next(err);
      res.redirect(req.baseUrl);
    });
  }
  res.redirect(req.baseUrl);
});

router.get('/', async function (req, res, next) {
  try {
    const { client_id, redirect_uri } = config.auth.vk; // eslint-disable-line camelcase
    const query = {
      client_id,
      display: 'page',
      scope: 'email,photos',
      response_type: 'code',
      redirect_uri,
      state: ''
    };
    const vkURI = 'https://oauth.vk.com/authorize?' + querystring.stringify(query);
    res.render('auth', { title: 'Express', vkURI, page: 'auth' });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async function (req, res, next) {
  try {
    const { login, password, reg } = req.body;
    let user = { name: login, login, password };

    // регистрация пользователя
    if (reg) {
      user = await users.upsertUser(user);
      return res.redirect(req.baseUrl);
    }

    user = await users.findUser(user);
    if (!user || await users.calcKey(password, user.salt) !== user.key) {
      return res.sendStatus(401);
    }

    if (!user.id) throw Error('Непонятная ошибка');

    req.session.userId = user.id;

    return res.redirect(req.baseUrl);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;