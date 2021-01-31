const express = require('express');
const router = express.Router();

const querystring = require('querystring');
const fetch = require('node-fetch');
const { URL, URLSearchParams } = require('url');

const config = require('../config');
const auth = require('../lib/auth');

router.get('/vk', async function (req, res, next) {
  try {
    const { code } = req.query;
    if (!code) return res.redirect(req.baseUrl);

    const { client_id, redirect_uri, client_secret } = config.auth.vk; // eslint-disable-line camelcase
    const params = { client_id, redirect_uri, client_secret, code };
    const url = new URL('https://oauth.vk.com/access_token');
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }
    const answer = await response.json();

    req.session.isVk = true;
    req.session.username = answer.email;

    return res.redirect(redirect_uri);
  } catch (err) {
    next(err);
  }
});

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
      state: 'http://ya.ru',
      from: 'from-url'
    };
    const vk = 'https://oauth.vk.com/authorize?' + querystring.stringify(query);
    res.render('auth', { title: 'Express', vk, page: 'auth' });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async function (req, res, next) {
  try {
    const { username, password, reg } = req.body;

    let user = null;

    if (reg) {
      user = await auth.createUser(username, password);
      return res.redirect(req.baseUrl);
    }

    user = await auth.findUser(username);
    if (!user || !await auth.checkPassword(user, password)) {
      return res.sendStatus(401);
    }

    req.session.username = user.name;
    res.redirect(req.baseUrl);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
